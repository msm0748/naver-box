import { useRef, useState, useCallback } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';

export default function CustomDropzone() {
  const [isFolder, setIsFolder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 파일/폴더 업로드 버튼 클릭 시 상태 변경 및 input 클릭 트리거
  const handleFileUpload = () => {
    setIsFolder(false);
    setTimeout(() => inputRef.current && inputRef.current.click(), 0);
  };
  const handleFolderUpload = () => {
    setIsFolder(true);
    setTimeout(() => inputRef.current && inputRef.current.click(), 0);
  };

  // 파일 드롭/선택 시 처리
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    // .DS_Store 파일 필터링
    const filtered = acceptedFiles.filter(
      (file) => file.name !== '.DS_Store' && !file.path?.endsWith('.DS_Store')
    );
    console.log('Drop completed!', filtered);
  }, []);

  // dropzone 훅 사용, 클릭은 막고 input을 직접 트리거
  const { getRootProps, getInputProps, acceptedFiles, isDragActive } =
    useDropzone({
      onDrop,
      noClick: true,
    });

  return (
    <section className="container">
      <div
        style={{
          height: '300px',
          border: '2px dashed #aaa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...getRootProps()}
      >
        {isDragActive ? (
          <p>여기에 파일을 놓으세요</p>
        ) : (
          <p>파일이나 폴더를 드래그하거나, 버튼을 클릭하세요</p>
        )}
      </div>
      <input
        {...getInputProps()}
        ref={inputRef}
        style={{ display: 'none' }}
        {...(isFolder ? { webkitdirectory: 'true', directory: 'true' } : {})}
      />
      <button type="button" onClick={handleFileUpload}>
        파일 업로드
      </button>
      <button type="button" onClick={handleFolderUpload}>
        폴더 업로드
      </button>
      <aside>
        <h4>Files</h4>
        <ul>
          {acceptedFiles.map((file) => (
            <li key={file.path || file.name}>
              {file.path || file.name} - {file.size} bytes
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
