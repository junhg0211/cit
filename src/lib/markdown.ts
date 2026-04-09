/**
 * markdown.ts — Markdown → HTML 변환기
 *
 * 지원 기능:
 *  - 헤딩 (# ~ ######)
 *  - 굵게 (**), 기울임 (*), 취소선 (~~), 인라인 코드 (`)
 *  - 링크 [text](url), 이미지 ![alt](url)
 *  - 순서 없는 목록 (- / * / +), 순서 있는 목록 (1.)
 *  - 인용 블록 (>)
 *  - 코드 블록 (```)
 *  - 수평선 (--- / *** / ___)
 *  - 표 (| col | col |)
 *      < : 왼쪽 셀과 병합 (colspan)
 *      ^ : 위쪽 셀과 병합 (rowspan)
 *  - 단락 & 줄바꿈
 *
 * Custom 태그 없음 — 표준 HTML 태그만 사용.
 */

/* ─────────────────────────────────────────────
   타입 정의
───────────────────────────────────────────── */

/** 표의 개별 셀 */
interface TableCell {
	content: string;
	colspan: number;
	rowspan: number;
	/** 병합으로 인해 렌더링 생략할 셀 */
	skip: boolean;
}

/** 목록 항목 */
interface ListItem {
	indent: number;
	ordered: boolean;
	content: string;
}

/** buildList 반환값 */
interface ListResult {
	html: string;
	nextIdx: number;
}

/** 셀 태그 종류 */
type CellTag = 'th' | 'td';

/** 열 정렬 */
type Align = 'left' | 'center' | 'right' | null;

/* ─────────────────────────────────────────────
   유틸
───────────────────────────────────────────── */

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/* ─────────────────────────────────────────────
   인라인 파싱
   (이미지, 링크, 굵게, 기울임, 취소선, 인라인코드)
───────────────────────────────────────────── */

function parseInline(text: string): string {
	// 인라인 코드 먼저 추출 (플레이스홀더로 대체)
	const codeChunks: string[] = [];
	text = text.replace(/`([^`]+)`/g, (_: string, code: string) => {
		codeChunks.push(`<code>${escapeHtml(code)}</code>`);
		return `\x00CODE${codeChunks.length - 1}\x00`;
	});

	// 이미지
	text = text.replace(
		/!\[([^\]]*)\]\(([^)]+)\)/g,
		(_: string, alt: string, src: string) =>
			`<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`
	);

	// 링크
	text = text.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		(_: string, label: string, href: string) =>
			`<a href="${escapeHtml(href)}">${parseInlineBasic(label)}</a>`
	);

	// 굵게 + 기울임 (***text***)
	text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');

	// 굵게 (**text**)
	text = text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');

	// 기울임 (*text*)
	text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

	// 취소선 (~~text~~)
	text = text.replace(/~~(.+?)~~/g, '<s>$1</s>');

	// 플레이스홀더 복원
	text = text.replace(/\x00CODE(\d+)\x00/g, (_: string, i: string) => codeChunks[+i]);

	return text;
}

/** 링크 내부 등 재귀 호출 방지용 간소 버전 */
function parseInlineBasic(text: string): string {
	text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
	text = text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
	text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
	text = text.replace(/~~(.+?)~~/g, '<s>$1</s>');
	return text;
}

/* ─────────────────────────────────────────────
   표 파싱
   < : colspan (왼쪽 셀에 병합)
   ^ : rowspan (위쪽 셀에 병합)
───────────────────────────────────────────── */

function parseTable(lines: string[]): string {
	// ── 행 파싱 ──────────────────────────────────────────────────────────────
	const rows: string[][] = lines.map((line) =>
		line
			.replace(/^\|/, '')
			.replace(/\|$/, '')
			.split('|')
			.map((c) => c.trim())
	);

	/** 셀이 수평 구분선(--- / :---: 등)인지 판별 */
	const isSepCell = (c: string) => /^:?-+:?$/.test(c);

	/** 행 전체가 수평 구분선인지 판별 (thead/tbody 경계) */
	const isFullSepRow = (row: string[]) => row.every(isSepCell);

	/** 구분선 셀 하나에서 정렬 추출 */
	function parseAlign(cell: string): Align {
		const left = cell.startsWith(':');
		const right = cell.endsWith(':');
		if (left && right) return 'center';
		if (right) return 'right';
		if (left) return 'left';
		return null;
	}

	// ── thead / tbody 분리 ───────────────────────────────────────────────────
	const fullSepIdx = rows.findIndex(isFullSepRow);

	/** 전체 구분선 행에서 열별 정렬 배열 추출 (없으면 빈 배열 → 전부 null) */
	const colAligns: Align[] = fullSepIdx >= 0 ? rows[fullSepIdx].map(parseAlign) : [];

	let headerRows: string[][];
	let bodyRows: string[][];

	if (fullSepIdx > 0) {
		headerRows = rows.slice(0, fullSepIdx);
		bodyRows = rows.slice(fullSepIdx + 1);
	} else if (fullSepIdx === 0) {
		headerRows = [];
		bodyRows = rows.slice(1);
	} else {
		headerRows = [];
		bodyRows = rows;
	}

	// ── th 범위 계산 ─────────────────────────────────────────────────────────
	// 각 행에서 `| - |` 단독 셀(구분자 셀)을 찾아 그 왼쪽 열 인덱스까지를 th 로 처리.
	// 구분자 셀이 없으면:
	//   - headerRows 소속 행 → 열 전체 th
	//   - bodyRows   소속 행 → 열 전체 td
	//
	// 구분자 셀이 여러 개면 첫 번째를 기준으로 삼는다.
	// 구분자 셀 자체(colIdx === sepColIdx)는 렌더링하지 않는다.

	/** 행에서 단독 구분자 셀(`-`)의 열 인덱스를 반환. 없으면 -1. */
	function findRowSepIdx(row: string[]): number {
		// 행 전체 구분선은 이미 걸러졌으므로, 여기서는 부분 구분자만 처리
		const idx = row.findIndex(isSepCell);
		return idx;
	}

	// ── colspan / rowspan 계산 ───────────────────────────────────────────────
	/** rawRows → TableCell 그리드 */
	function buildGrid(rawRows: string[][]): TableCell[][] {
		const grid: TableCell[][] = rawRows.map((row) =>
			row.map((content) => ({ content, colspan: 1, rowspan: 1, skip: false }))
		);

		const R = grid.length;
		if (R === 0) return grid;
		const C = grid[0].length;

		// 1단계: colspan (<) — 오른쪽에서 왼쪽으로 순회
		for (let r = 0; r < R; r++) {
			for (let c = C - 1; c >= 1; c--) {
				if (grid[r][c]?.content === '<') {
					let base = c - 1;
					while (base >= 0 && grid[r][base]?.content === '<') base--;
					if (base >= 0 && grid[r][base]) {
						grid[r][base].colspan += 1;
						grid[r][c].skip = true;
					}
				}
			}
		}

		// 2단계: rowspan (^) — 아래에서 위로 순회
		for (let c = 0; c < C; c++) {
			for (let r = R - 1; r >= 1; r--) {
				if (grid[r][c]?.content === '^') {
					let base = r - 1;
					while (base >= 0 && grid[base][c]?.content === '^') base--;
					if (base >= 0 && grid[base][c]) {
						grid[base][c].rowspan += 1;
						grid[r][c].skip = true;
					}
				}
			}
		}

		return grid;
	}

	// ── 렌더링 ───────────────────────────────────────────────────────────────
	/**
	 * @param grid        buildGrid 결과
	 * @param rawRows     원본 행 배열 (행 내 구분자 셀 위치 파악용)
	 * @param defaultTag  행 내 구분자 셀이 없을 때 사용할 태그
	 */
	function renderRows(grid: TableCell[][], rawRows: string[][], defaultTag: CellTag): string {
		return grid
			.map((row, rowIdx) => {
				const rawRow = rawRows[rowIdx] ?? [];
				const sepColIdx = findRowSepIdx(rawRow);

				const cells = row
					.map((cell, colIdx) => ({ cell, colIdx }))
					.filter(({ cell, colIdx }) => {
						if (cell.skip) return false;
						if (colIdx === sepColIdx) return false;
						return true;
					})
					.map(({ cell, colIdx }) => {
						// th/td 결정
						let cellTag: CellTag;
						if (sepColIdx >= 0) {
							cellTag = colIdx < sepColIdx ? 'th' : defaultTag;
						} else {
							cellTag = defaultTag;
						}

						// 정렬 (전체 구분선의 해당 열 기준)
						// 행 내 구분자 셀이 있을 때는 인덱스 보정 필요 없음 —
						// colAligns 는 원본 열 인덱스 그대로 대응
						const align: Align = colAligns[colIdx] ?? null;

						const attrs: string[] = [];
						if (cell.colspan > 1) attrs.push(`colspan="${cell.colspan}"`);
						if (cell.rowspan > 1) attrs.push(`rowspan="${cell.rowspan}"`);
						if (align) attrs.push(`style="text-align:${align}"`);
						const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
						return `<${cellTag}${attrStr}>${parseInline(cell.content)}</${cellTag}>`;
					})
					.join('');

				return `<tr>${cells}</tr>`;
			})
			.join('\n');
	}

	const hGrid = buildGrid(headerRows);
	const bGrid = buildGrid(bodyRows);

	let html = '<table>\n';
	if (hGrid.length) {
		// 헤더 행은 기본 태그가 th (구분자 없으면 전체 th)
		html += '<thead>\n' + renderRows(hGrid, headerRows, 'th') + '\n</thead>\n';
	}
	if (bGrid.length) {
		// 바디 행은 기본 태그가 td (구분자 없으면 전체 td)
		html += '<tbody>\n' + renderRows(bGrid, bodyRows, 'td') + '\n</tbody>\n';
	}
	html += '</table>';
	return html;
}

/* ─────────────────────────────────────────────
   목록 파싱 (중첩 지원)
───────────────────────────────────────────── */

function parseList(lines: string[]): string {
	const items: (ListItem | null)[] = lines.map((line) => {
		const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
		if (!match) return null;
		return {
			indent: match[1].length,
			ordered: /^\d+\./.test(match[2]),
			content: match[3]
		};
	});

	function buildList(items: (ListItem | null)[], startIdx: number, baseIndent: number): ListResult {
		let html = '';
		let i = startIdx;
		let tag: 'ul' | 'ol' | null = null;

		while (i < items.length) {
			const item = items[i];
			if (!item || item.indent < baseIndent) break;

			if (item.indent === baseIndent) {
				if (!tag) {
					tag = item.ordered ? 'ol' : 'ul';
					html += `<${tag}>`;
				}

				// 다음 줄이 더 깊은 들여쓰기면 중첩 목록
				let inner = '';
				const nextItem = items[i + 1];
				if (nextItem && nextItem.indent > baseIndent) {
					const result = buildList(items, i + 1, nextItem.indent);
					inner = result.html;
					i = result.nextIdx;
				} else {
					i++;
				}

				html += `<li>${parseInline(item.content)}${inner}</li>`;
			} else {
				break;
			}
		}

		if (tag) html += `</${tag}>`;
		return { html, nextIdx: i };
	}

	const firstItem = items.find((item) => item !== null);
	return buildList(items, 0, firstItem?.indent ?? 0).html;
}

/* ─────────────────────────────────────────────
   인용 블록 파싱 (중첩 지원)
───────────────────────────────────────────── */

function parseBlockquote(lines: string[]): string {
	// 한 겹 > 제거
	const inner = lines.map((l) => l.replace(/^>\s?/, ''));
	return `<blockquote>${markdownToHtml(inner.join('\n'))}</blockquote>`;
}

/* ─────────────────────────────────────────────
   메인 파서
───────────────────────────────────────────── */

const BLOCK_START_RE = /^(#{1,6}\s|```|>|\|.*\||\s*([-*+]|\d+\.)\s|---+|\*\*\*+|___+)/;

export function markdownToHtml(markdown: string): string {
	const lines = markdown.split('\n');
	const output: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		/* ── 코드 블록 ``` ── */
		if (/^```/.test(line)) {
			const lang = line.slice(3).trim();
			const codeLines: string[] = [];
			i++;
			while (i < lines.length && !/^```/.test(lines[i])) {
				codeLines.push(lines[i]);
				i++;
			}
			i++; // 닫는 ```
			const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : '';
			output.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
			continue;
		}

		/* ── 수평선 ── */
		if (/^(---+|\*\*\*+|___+)\s*$/.test(line)) {
			output.push('<hr>');
			i++;
			continue;
		}

		/* ── 헤딩 ── */
		const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			output.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
			i++;
			continue;
		}

		/* ── 표 ── */
		if (/^\|.+\|/.test(line)) {
			const tableLines: string[] = [];
			while (i < lines.length && /^\|.+\|/.test(lines[i])) {
				tableLines.push(lines[i]);
				i++;
			}
			output.push(parseTable(tableLines));
			continue;
		}

		/* ── 인용 블록 ── */
		if (/^>/.test(line)) {
			const bqLines: string[] = [];
			while (i < lines.length && /^>/.test(lines[i])) {
				bqLines.push(lines[i]);
				i++;
			}
			output.push(parseBlockquote(bqLines));
			continue;
		}

		/* ── 목록 ── */
		if (/^(\s*)([-*+]|\d+\.)\s/.test(line)) {
			const listLines: string[] = [];
			while (i < lines.length && /^(\s*)([-*+]|\d+\.)\s/.test(lines[i])) {
				listLines.push(lines[i]);
				i++;
			}
			output.push(parseList(listLines));
			continue;
		}

		/* ── 빈 줄 ── */
		if (line.trim() === '') {
			i++;
			continue;
		}

		/* ── 단락 ── */
		const paraLines: string[] = [];
		while (i < lines.length && lines[i].trim() !== '' && !BLOCK_START_RE.test(lines[i])) {
			paraLines.push(lines[i]);
			i++;
		}
		if (paraLines.length) {
			const paraHtml = paraLines.map((l) => parseInline(l)).join('<br>\n');
			output.push(`<p>${paraHtml}</p>`);
		}
	}

	return output.join('\n');
}
