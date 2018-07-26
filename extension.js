const th = document.body;
const s = document.createElement("script");
s.setAttribute("type", "text/javascript");
s.setAttribute("src", chrome.extension.getURL("ckeditor.js"));
th.appendChild(s);
const loadCode = () => {
  const s1 = document.createElement("script");
  s1.setAttribute("type", "text/javascript");
  debugger;
  s1.setAttribute("src", chrome.extension.getURL("dist/bundle.js"));
  th.appendChild(s1);
};
s.onload = loadCode;

const getFromCache = url => {
  const cachedValue = localStorage[`richGitHub:${url}`];
  if (cachedValue && getIsFresh(url)) {
    return Promise.resolve(JSON.parse(cachedValue));
  }
  return null;
};

const setCache = (url, value) => {
  value.then(v => {
    localStorage[`richGitHub:${url}`] = JSON.stringify(v);
    localStorage[`richGitHub:${url}:expiry`] = Date.now() + 10000000000000000;
  });
  return value;
};

const getIsFresh = url => {
  const expiry = localStorage[`richGitHub:${url}:expiry`];
  // return expiry && expiry < Date.now()
  return true;
};
let headRef;
let base;
let headUser;
let repo;
let filePaths;
let basePulls;
let baseContentsUrls;
let headContentUrls;
let contentUrls;
let baseContentFiles;
let headContentFiles;
let pairedUrls;
let headContentDecoded;
let baseContentDecoded;
const isQuickPull =
  location.pathname.includes("...") &&
  location.pathname.split("/")[3] === "compare" &&
  location.href.slice(location.href.indexOf("?")).includes("quick_pull");
const draftsJSON = localStorage["githubDraft"]
  ? JSON.parse(localStorage["githubDraft"])
  : {};
const currentDraft = localStorage["currentDraft"];
if (isQuickPull && draftsJSON && currentDraft) {
  delete localStorage["currentDraft"];
  if (currentDraft) delete draftsJSON[currentDraft];
  localStorage["githubDraft"] = JSON.stringify(draftsJSON);
}

const getString = arrayBuffer => {
  const uint8array = new TextEncoder("utf-8").encode("¢");
  const string = new TextDecoder("utf-8").decode(arrayBuffer.value);
  return string;
};
// let diffShown
// let richDiffButton
// let parent
// let fileHeader
let diffListener;
let codeListener;
let hasStateChanged;
let prevState;
const toggleChildren = (parent, fileHeader) => {
  debugger;
  Array.from(parent.childNodes).forEach(node => {
    if (node !== fileHeader && node.style) {
      node.style.display = node.style.display !== "none" ? "none" : "block";
    }
  });
};
const fetchDiff = (htmlOld, htmlNew) =>
  fetch("http://127.0.0.1:8000/", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json; charset=utf-8"
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify({ htmlOld, htmlNew }) // body data type must match "Content-Type" header
  }).then(res => res.json());
const showCodeDiff = (
  path,
  fileHeader,
  richDiffButton,
  parent,
  iframe
) => () => {
  debugger;
  toggleChildren(parent, fileHeader);
  richDiffButton.innerHTML = "Rich diff";
  richDiffButton.removeEventListener("click", codeListener, true);
  const diffListener = getAndShowDiff(path, richDiffButton, iframe);
  richDiffButton.addEventListener("click", diffListener, true);
};

const getAndShowDiff = (path, richDiffButton, iframe) => () =>
  contentUrls.then(contents => {
    debugger;
    baseContentFile = fetch(contents[path].base)
      .then(res => res.body.getReader().read())
      .then(getString);
    headContentFile = fetch(contents[path].head)
      .then(res => res.body.getReader().read())
      .then(getString);
    Promise.all([baseContentFile, headContentFile])
      .then(cs => fetchDiff(...cs))
      .then(d => {
        debugger;
        const fileHeader = document.querySelector(`[data-path="${path}"]`);
        const parent = fileHeader.parentElement;
        if (!iframe) {
          const newIframe = document.createElement("iframe");
          newIframe.style = "width: 100%; height: 800px";
          newIframe.frameBorder = 0;
          const style = document.createElement("style");
          const cssUrl = `https://raw.githubusercontent.com${location.pathname.match(
            /^\/[\w\d]+\/[\w\d]+\//
          )}${base.slice(base.indexOf(":") + 1)}/content.css`;
          const cssFile = fetch(cssUrl)
            .then(res => res.body.getReader().read())
            .then(getString);
          cssContentDecoded = cssFile.then(css => {
            richDiffButton.innerHTML = "Code diff";
            toggleChildren(parent, fileHeader);
            parent.appendChild(newIframe);
            newIframe.contentDocument.head.appendChild(style);
            newIframe.contentDocument.body.innerHTML = d.diff.htmlDiff;
            style.innerHTML = css;

            richDiffButton.removeEventListener("click", diffListener, true);
            codeListener = showCodeDiff(
              path,
              fileHeader,
              richDiffButton,
              parent,
              newIframe
            );
            richDiffButton.addEventListener("click", codeListener, true);
          });
        } else {
          toggleChildren(parent, fileHeader);
          richDiffButton.removeEventListener("click", diffListener, true);
          codeListener = showCodeDiff(
            path,
            fileHeader,
            richDiffButton,
            parent,
            iframe
          );
          richDiffButton.addEventListener("click", codeListener, true);
        }
      });
  });

setInterval(() => {
  hasStateChanged = prevState !== location.href;
  prevState = location.href;
  if (hasStateChanged && location.pathname.match(/pull\/\d+\/files/)) {
    headRef = document.querySelector(".gh-header-meta .head-ref").title;
    base = document.querySelector(".gh-header-meta .base-ref").title;
    headUser = headRef.split("/")[0];
    repo = location.pathname.split("/")[2];
    filePaths = [...document.querySelectorAll(".file-info a")].map(
      x => x.outerText
    );
    const filesUrl = `https://api.github.com/repos${location.pathname.replace(
      "/pull/",
      "/pulls/"
    )}`;

    const pullUrl = filesUrl.slice(0, filesUrl.length - 6);
    basePulls =
      getFromCache(filesUrl) ||
      setCache(location.href, fetch(filesUrl).then(res => res.json()));
    const pull =
      getFromCache(pullUrl) ||
      setCache(location.href, fetch(pullUrl).then(res => res.json()));
    contentUrls = Promise.all([basePulls, pull]).then(([pulls, pull]) =>
      pulls.reduce(
        (pairsAcc, p, i) => ({
          ...pairsAcc,
          [p.filename]: {
            base: `https://raw.githubusercontent.com${location.pathname.match(
              /^\/[\w\d]+\/[\w\d]+\//
            )}${pull.base.ref}/${p.filename}`,
            head: `https://raw.githubusercontent.com${location.pathname.match(
              /^\/[\w\d]+\/[\w\d]+\//
            )}${pull.head.ref}/${p.filename}`
          }
        }),
        {}
      )
    );
    contentUrls.then(contents =>
      Object.keys(contents).forEach(pathKey => {
        debugger;
        if (pathKey.match(/\.html$/)) {
          const richDiffButton = document.createElement("button");
          richDiffButton.className = "btn btn-sm";
          richDiffButton.innerHTML = "Rich diff";
          diffListener = getAndShowDiff(pathKey, richDiffButton);
          richDiffButton.addEventListener("click", diffListener, true);
          document
            .querySelector(`[data-path="${pathKey}"] .file-actions`)
            .appendChild(richDiffButton);
        }
      })
    );
  }
}, 100);
