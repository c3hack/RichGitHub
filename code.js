

const editorForm = document.createElement('form')
editorForm.innerHTML = `<textarea name="richGitHub" id="richGitHub" rows="10" cols="80"></textarea>`
const editorEl = editorForm.childNodes[0]
const draftsJSON = localStorage['githubDraft']
const gitHubDrafts = draftsJSON ? JSON.parse(draftsJSON) : {}
const draftsList = document.createElement('ul')
draftsList.id = 'richGitHubDrafts'
setTimeout(() => {
    document.body.querySelector('.octotree_views').appendChild(draftsList)

}, 2000)
Object.entries(gitHubDrafts).forEach(([ url, { title } ]) => {
    const li = document.createElement('li')
    li.innerHTML = `<a href="${url}">${title}</a>`
    draftsList.appendChild(li)
})
try {
    document.querySelector('.commit-create').appendChild(editorEl)
    document.querySelector('.CodeMirror').setAttribute('style', 'display:none')
} catch (e) {
    debugger
}
ClassicEditor
    .create(document.querySelector( '#richGitHub' ) )
    .then(editor => {
        const currentDraft = localStorage['currentDraft']
        const drafts = localStorage['githubDraft'] ? JSON.parse(localStorage['githubDraft']) : {}
        editor.setData(location.href === currentDraft && drafts && drafts[location.href] && drafts[location.href].content ? drafts[location.href].content : document.querySelector('textarea').value)
        const codeMirrorInstance = document.querySelector('.CodeMirror').CodeMirror
        codeMirrorInstance.doc.setValue(editor.getData())
        localStorage['currentDraft'] = location.href
        editor.model.document.on( 'change', () => {
            localStorage['currentDraft'] = location.href
            localStorage['githubDraft'] = JSON.stringify({...gitHubDrafts, [location.href]: { content: editor.getData(), title: location.pathname.split('/').slice(-1)[0] }})
            codeMirrorInstance.doc.setValue(editor.getData())
        } );
    })
    .catch( error => {
        // console.error( error )
    })