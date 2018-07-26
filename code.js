// import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
// import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
// import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
// import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
// import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
// import Code from "@ckeditor/ckeditor5-basic-styles/src/code";
// import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
// import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
// import ListPlugin from '@ckeditor/ckeditor5-list/src/list';

import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
const style = document.createElement("style");
style.innerHTML = `.ck-editor ul, .ck-editor ol {
    padding-left: 15px;
}`;
document.head.appendChild(style);
const editorForm = document.createElement("form");
editorForm.innerHTML = `<textarea name="richGitHub" id="richGitHub" rows="10" cols="80"></textarea>`;
const editorEl = editorForm.childNodes[0];
const draftsJSON = localStorage["githubDraft"];
const gitHubDrafts = draftsJSON ? JSON.parse(draftsJSON) : {};
const draftsList = document.createElement("div");
draftsList.innerHTML = "<ul><strong>Drafts</strong></ul>";
draftsList.id = "richGitHubDrafts";
draftsList.style = "padding-left: 20px";
setTimeout(() => {
  document.body.querySelector(".octotree_views").appendChild(draftsList);
}, 2000);
Object.entries(gitHubDrafts).forEach(([url, { title }]) => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="${url}">${title}</a>`;
  draftsList.childNodes[0].appendChild(li);
});
try {
  document.querySelector(".commit-create").appendChild(editorEl);
  document.querySelector(".CodeMirror").setAttribute("style", "display:none");
} catch (e) {
  debugger;
}
ClassicEditor.create(
  document.querySelector("#richGitHub")
  // , {
  //   plugins: [
  //     Essentials,
  //     Paragraph,
  //     Bold,
  //     Italic,
  //     Strikethrough,
  //     Underline,
  //     Code,
  //     List
  //   ],
  //   toolbar: ["bold", "italic", "strikethrough", "underline", "code", "list"]
  // }
)
  .then(editor => {
    const currentDraft = localStorage["currentDraft"];
    const drafts = localStorage["githubDraft"]
      ? JSON.parse(localStorage["githubDraft"])
      : {};
    editor.setData(
      location.href === currentDraft &&
      drafts &&
      drafts[location.href] &&
      drafts[location.href].content
        ? drafts[location.href].content
        : document.querySelector("textarea").value
    );
    const codeMirrorInstance = document.querySelector(".CodeMirror").CodeMirror;
    codeMirrorInstance.doc.setValue(editor.getData());
    localStorage["currentDraft"] = location.href;
    editor.model.document.on("change", () => {
      localStorage["currentDraft"] = location.href;
      localStorage["githubDraft"] = JSON.stringify({
        ...gitHubDrafts,
        [location.href]: {
          content: editor.getData(),
          title: location.pathname.split("/").slice(-1)[0]
        }
      });
      codeMirrorInstance.doc.setValue(editor.getData());
    });
  })
  .catch(error => {
    // console.error( error )
  });
