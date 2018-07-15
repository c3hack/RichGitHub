try {
const editorDiv = document.createElement('div')
editorDiv.innerHTML = `<textarea name="content" id="richGitHub"></textarea>`
const editorEl = editorDiv.childNodes[0]
document.querySelector('.commit-create').appendChild(editorEl)
document.querySelector('.CodeMirror').setAttribute('style', 'display:none')
ClassicEditor
    .create(document.querySelector( '#richGitHub' ) )
    .then(editor => {
        editor.setData(document.querySelector('textarea').value)
        editor.model.change(() => {
            const codeMirrorInstance = document.querySelector('.CodeMirror').CodeMirror
            codeMirrorInstance.doc.setValue(editor.getData())
        })
    })
    .catch( error => {
        console.error( error )
    })
} catch (e) {
    debugger
}
