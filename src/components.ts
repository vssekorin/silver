export function homeIcon(): HTMLElement {
    const span = document.createElement("span");
    span.className = "home-icon";
    span.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12">
            <path d="M8 1L1 7V15H6V10H10V15H15V7L8 1Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    return span;
}

export function toggleIcon(): HTMLElement {
    const span = document.createElement("span");
    span.className = "toggle-icon";
    span.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 16 16" width="12" height="12">
            <path class="icon-path" d="M3 2L13 8L3 14Z" 
                  fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
    `;
    return span;
}

export function plusIcon(): HTMLElement {
    const span = document.createElement("span");
    span.className = "plus-icon";
    span.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12">
            <path d="M8 3L8 13M3 8L13 8" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    return span;
}

export function circleIcon(): HTMLElement {
    const span = document.createElement("span");
    span.className = "circle-icon";
    span.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 16 16" width="12" height="12">
            <circle class="icon-path" cx="8" cy="8" r="6" 
                    fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
    `;
    return span;
}

export function squareIcon(): HTMLElement {
    const span = document.createElement("span");
    span.className = "square-icon";
    span.innerHTML = `
        <svg class="icon-svg" viewBox="0 0 16 16" width="12" height="12">
            <rect class="icon-path" x="2" y="2" width="12" height="12" 
                  fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
    `;
    return span;
}

export function separator(): HTMLElement {
    const separator = document.createElement("span");
    separator.textContent = " > ";
    return separator;
}
