
const getAndShowDiff = () => {
    const headRef = document.querySelector('.gh-header-meta .head-ref').title
    const base = document.querySelector('.gh-header-meta .head-ref').title
    const headUser = headRef.split('/')[0]
    const repo = location.pathname.split('/')[2]
    const filePaths = [...document.querySelectorAll('.file-info a')].map(x => x.outerText)
    const basePulls = fetch(`https://api.github.com/repos${location.pathname.replace('/pull/', '/pulls/')}`).then(res => res.json())
    const baseContentsUrls = basePulls.then(json => json.map(f => f.contents_url))
    const headContentUrls = basePulls.then(pulls => pulls.map(({ filename }) => `https://api.github.com/repos/${headUser}/${repo}/contents/${filename}`))
    const baseContentFiles = baseContentsUrls.then(urls => Promise.all(urls.map(url => fetch(url).then(res => res.json()))))
    const headContentFiles = headContentUrls.then(urls => Promise.all(urls.map(url => fetch(url).then(res => res.json()))))

    const headContentDecoded = headContentFiles.then(files => files.map(({ content, path }) => ({ path, content: atob(content) })))
    const baseContentDecoded = baseContentFiles.then(files => files.map(({ content, path }) => ({ path, content: atob(content) })))
    const diffs = Promise.all([baseContentDecoded, headContentDecoded]).then(contents => fetchDiff(...contents))
    diffs.then(ds => {
        ds.forEach(d => {
            const fileHeader = document.querySelector(`[data-path="${d.path}"]`)
            const parent = fileHeader.parentElement
            parent.innerHTML = fileHeader.outerHTML + d.diff.htmlDiff
        })
    })
    // diffs.then(console.log)
    const fetchDiff = (htmlOld, htmlNew) => 
        fetch('http://127.0.0.1:8000/', {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify({ htmlOld, htmlNew }), // body data type must match "Content-Type" header
    }).then(res => res.json())
}
if (location.pathname.match(/pull\/\d+\/files/)) {
    debugger
    const richDiffButton = document.createElement('button')
    richDiffButton.innerHTML = 'rich diff'
    richDiffButton.addEventListener('click', getAndShowDiff)
    document.querySelector('.file-actions').appendChild(richDiffButton)
}
{/* <button class="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rendered js-rendered" aria-label="Display the rich diff" type="submit" data-disable-with="">
                <svg class="octicon octicon-file" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>
              </button> */}
//               const a = 
//               `<span class="BtnGroup">
//               <form class="BtnGroup-form js-prose-diff-toggle-form" action="/MicrosoftDocs/CSIDev-Public/diffs/0?base_sha=9962a62075a79c4a936bad58256dbe8811046df6&amp;commentable=true&amp;pull_number=276&amp;sha1=9962a62075a79c4a936bad58256dbe8811046df6&amp;sha2=3a69a80b75cd9ef5a803a6920f53ea1d765db725" accept-charset="UTF-8" method="get"><input name="utf8" type="hidden" value="✓">              <button class="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n source js-source selected" aria-label="Display the source diff" type="submit" data-disable-with="">
//                    <svg class="octicon octicon-code" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M9.5 3L8 4.5 11.5 8 8 11.5 9.5 13 14 8 9.5 3zm-5 0L0 8l4.5 5L6 11.5 2.5 8 6 4.5 4.5 3z"></path></svg>
//                  </button>
//    </form>         <form class="BtnGroup-form js-prose-diff-toggle-form" action="/MicrosoftDocs/CSIDev-Public/diffs/0?base_sha=9962a62075a79c4a936bad58256dbe8811046df6&amp;commentable=true&amp;pull_number=276&amp;sha1=9962a62075a79c4a936bad58256dbe8811046df6&amp;sha2=3a69a80b75cd9ef5a803a6920f53ea1d765db725&amp;short_path=17c97b9" accept-charset="UTF-8" method="get"><input name="utf8" type="hidden" value="✓">
//    <button class="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rendered js-rendered" aria-label="Display the rich diff" data-disable-with="" onClick="getAndShowDiff()">
//                    <svg class="octicon octicon-file" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>
//                  </button>
//    </form>        </span>`