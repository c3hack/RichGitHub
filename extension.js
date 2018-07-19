const th = document.body
const s = document.createElement('script');
s.setAttribute('type', 'text/javascript');
s.setAttribute('src', chrome.extension.getURL('ckeditor.js'));
th.appendChild(s);
const loadCode = () => {
    const s1 = document.createElement('script');
    s1.setAttribute('type', 'text/javascript');
    s1.setAttribute('src', chrome.extension.getURL('code.js'));
    th.appendChild(s1);
}
s.onload = loadCode


let headRef
let base
let headUser
let repo
let filePaths
let basePulls
let baseContentsUrls
let headContentUrls
let contentUrls
let baseContentFiles
let headContentFiles
let pairedUrls
let headContentDecoded
let baseContentDecoded
const getAndShowDiff = path => () => {
    debugger
  contentUrls.then(contents => {
    baseContentFile = fetch(contents[path].base).then(res => res.json())
    headContentFile = fetch(contents[path].head).then(res => res.json())
    headContentDecoded = headContentFile.then(({ content, path }) => ({
      path,
      content: atob(content)
    }))
    baseContentDecoded = baseContentFile.then(({ content, path }) => ({
      path,
      content: atob(content)
    }))
    Promise.all([ baseContentDecoded, headContentDecoded ])
        .then(cs => fetchDiff(...cs))
        .then(d => {
            const fileHeader = document.querySelector(
                `[data-path="${path}"]`
            )
            const parent = fileHeader.parentElement
            const iframe = document.createElement('iframe')
            iframe.style = 'width: 100%; height: 100%'
            iframe.frameBorder = 0
            const style = document.createElement('style')
            const cssFile = fetch(`https://api.github.com/repos${location.pathname.match(/^\/[\w\d]+\/[\w\d]+\//)}contents/content.css`).then(res => res.json())
            debugger
            cssContentDecoded = cssFile.then(({ content, path }) =>  {
                debugger
                const decoded = atob(content)
                style.innerHTML = decoded
                parent.innerHTML = ''
                parent.appendChild(fileHeader)
                parent.appendChild(iframe)
                iframe.contentDocument.head.appendChild(style)
                iframe.contentDocument.body.innerHTML = d.diff.htmlDiff
            })
        
                // parent.innerHTML = fileHeader.outerHTML + d.diff.htmlDiff
          
        })
  })
  const fetchDiff = (htmlOld, htmlNew) =>
    fetch('http://127.0.0.1:8000/', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({ htmlOld, htmlNew }) // body data type must match "Content-Type" header
    }).then(res => res.json())
}
debugger
if (location.pathname.match(/pull\/\d+\/files/)) {
    debugger
  headRef = document.querySelector('.gh-header-meta .head-ref').title
  base = document.querySelector('.gh-header-meta .head-ref').title
  headUser = headRef.split('/')[0]
  repo = location.pathname.split('/')[2]
  filePaths = [...document.querySelectorAll('.file-info a')].map(
    x => x.outerText
  )
  basePulls = fetch(
    `https://api.github.com/repos${location.pathname.replace(
      '/pull/',
      '/pulls/'
    )}`
  ).then(res => res.json())
  contentUrls = basePulls.then(pulls =>
    pulls.reduce(
      (pairsAcc, pull, i) => ({
        ...pairsAcc,
        [pull.filename]: {
          base: pull.contents_url,
          head: `https://api.github.com/repos/${headUser}/${repo}/contents/${pull.filename}`
        }
      }),
      {}
    )
  )
  contentUrls.then(contents =>
    Object.keys(contents).forEach(pathKey => {
      const richDiffButton = document.createElement('button')
      richDiffButton.innerHTML = 'rich diff'
      richDiffButton.addEventListener('click', getAndShowDiff(pathKey))
      document
        .querySelector(`[data-path="${pathKey}"] .file-actions`)
        .appendChild(richDiffButton)
    })
  )
}