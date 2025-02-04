// TinyMCE initialization
tinymce.init({
    selector: '#content',
    plugins: [
        // Core editing features
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
        'image', 'link', 'lists', 'media', 'searchreplace',
        'table', 'visualblocks', 'wordcount',
        // Premium features
        'checklist', 'mediaembed', 'casechange', 'export',
        'formatpainter', 'pageembed', 'a11ychecker',
        'tinymcespellchecker', 'permanentpen', 'powerpaste',
        'advtable', 'advcode', 'editimage', 'advtemplate',
        'ai', 'mentions', 'tinycomments', 'tableofcontents',
        'footnotes', 'mergetags', 'autocorrect', 'typography',
        'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
        'bold italic underline strikethrough | link image media table mergetags | ' +
        'addcomment showcomments | spellcheckdialog a11ycheck typography | ' +
        'align lineheight | checklist numlist bullist indent outdent | ' +
        'emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
    ],
    ai_request: (request, respondWith) => respondWith.string(
        () => Promise.reject('See docs to implement AI Assistant')
    ),
    height: '80vh',
    content_style: `
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
    `
});
