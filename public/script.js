document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileList = document.getElementById('fileList');

    function loadFiles() {
        fetch('/files')
            .then(response => response.json())
            .then(files => {
                fileList.innerHTML = '';
                files.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <span>${file.name}</span>
                        <div>
                            <button onclick="deleteFile('${file.name}')" class="delete-btn">Delete</button>
                        </div>
                    `;
                    fileList.appendChild(fileItem);
                });
            });
    }

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('fileInput');
        formData.append('file', fileInput.files[0]);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadFiles();
            fileInput.value = '';
        });
    });

    window.deleteFile = function(filename) {
        fetch(`/files/${filename}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            loadFiles();
        });
    }

    loadFiles();
});
