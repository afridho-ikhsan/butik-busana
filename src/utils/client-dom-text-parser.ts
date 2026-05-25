export function parseTextFromDOM(dom: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dom, 'text/html');
    const textContent = doc.body.textContent || "";

    return textContent
}