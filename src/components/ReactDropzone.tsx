import { FileWithPath, useDropzone } from 'react-dropzone';

export default function ReactDropzone() {
  const onDrop = (acceptedFiles: FileWithPath[]) => {
    const filteredFiles = acceptedFiles.filter(
      (file) => file.name !== '.DS_Store' && !file.path?.endsWith('.DS_Store')
    );

    console.log('Drop completed!', filteredFiles);
    // Handle your files here after drop is completed
  };
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <section className="container">
      <div
        style={{
          height: '300px',
          border: '2px dashed #aaa',
          borderRadius: '8px',
        }}
        {...getRootProps({ className: 'dropzone' })}
      >
        <input {...getInputProps()} directory="" webkitdirectory="" />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  );
}
