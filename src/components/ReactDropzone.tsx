import { Box } from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import {
  DropEvent,
  FileRejection,
  FileWithPath,
  useDropzone,
} from 'react-dropzone';

export default function CustomDropzone() {
  const [isFolder, setIsFolder] = useState(false);

  // 파일/폴더 업로드 버튼 클릭 시 상태 변경 및 input 클릭 트리거
  const handleFileUpload = () => {
    setIsFolder(false);
    setTimeout(() => open(), 0);
  };
  const handleFolderUpload = () => {
    setIsFolder(true);
    setTimeout(() => open(), 0);
  };

  // 파일 드롭/선택 시 처리
  const onDrop = (
    acceptedFiles: FileWithPath[],
    _: FileRejection[],
    event: DropEvent
  ) => {
    // .DS_Store 파일 필터링
    const filtered = acceptedFiles.filter(
      (file) => file.name !== '.DS_Store' && !file.path?.endsWith('.DS_Store')
    );

    console.log('Drop completed!', filtered);

    if ('target' in event && event.target instanceof HTMLElement) {
      console.log(event.target.dataset.resourcePath, 'event');
    }
  };

  // dropzone 훅 사용, 클릭은 막고 input을 직접 트리거
  const { getRootProps, getInputProps, acceptedFiles, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <section className="container">
      <Box
        w="full"
        h="400px"
        border="1px solid black"
        p="4"
        {...getRootProps()}
      >
        <Box
          className="folder"
          border="1px solid"
          w="50px"
          h="50px"
          bg="blue"
          data-resource-path="folder"
        ></Box>
      </Box>
      <input
        {...getInputProps()}
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
