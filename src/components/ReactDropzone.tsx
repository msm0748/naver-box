import { Box, Progress, Text } from '@chakra-ui/react';
import { useState } from 'react';
import {
  DropEvent,
  FileRejection,
  FileWithPath,
  useDropzone,
} from 'react-dropzone';
import ky from 'ky';

export default function CustomDropzone() {
  const [isFolder, setIsFolder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 파일/폴더 업로드 버튼 클릭 시 상태 변경 및 input 클릭 트리거
  const handleFileUpload = () => {
    setIsFolder(false);
    setTimeout(() => open(), 0);
  };
  const handleFolderUpload = () => {
    setIsFolder(true);
    setTimeout(() => open(), 0);
  };

  const uploadFiles = async (files: FileWithPath[]) => {
    setUploadProgress(0);

    try {
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await ky
          .post('http://localhost:8000/files/upload', {
            body: formData,
          })
          .json();

        console.log(`Uploaded: ${file.name}`, response);

        // 진행률 계산 (예: 파일 개수 기준)
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      console.log('All uploads completed!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
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

    // 파일이 있으면 업로드 시작
    if (filtered.length > 0) {
      uploadFiles(filtered);
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

        {/* 드래그 앤 드롭 안내 텍스트 */}
        <Text textAlign="center" mt="4">
          파일을 이곳에 드래그하거나 아래 버튼을 클릭하세요
        </Text>
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

      {/* 업로드 진행률 표시 */}
      <Box mt="4" w="full">
        <Text mb="2">업로드 진행률: {uploadProgress}%</Text>
        <Progress.Root value={uploadProgress} maxW="240px">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>

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
