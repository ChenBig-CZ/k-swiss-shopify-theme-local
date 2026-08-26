document.querySelectorAll('.mega-menu__link').forEach(elem => {
    if (elem.textContent.includes('|')) {
        const title = elem.textContent.split('|')[0].replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        const img = elem.textContent.split('|')[1].replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        elem.innerHTML = `
            <img
                src="${img}"
                alt=""
                width=""
                height=""
                style="max-width: 100%; height: auto; margin-bottom: .4rem;">
            <div style="text-align: center">
                ${title}
            </div>
        `
        elem.closest('.mega-menu__list').style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))'
    }
})

document.querySelectorAll('.menu-drawer__menu-item').forEach(elem => {
    if (elem.textContent.includes('|')) {
        const title = elem.textContent.split('|')[0].replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        const img = elem.textContent.split('|')[1].replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        elem.innerHTML = `
            <div>
                <img
                    src="${img}"
                    alt=""
                    width=""
                    height=""
                    style="max-width: 100%; height: auto; margin-bottom: .4rem;">
                <div style="text-align: center">
                    ${title}
                </div>
            </div>
        `
    }
})
