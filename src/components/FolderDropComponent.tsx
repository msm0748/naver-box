import { useState, useCallback, DragEvent } from 'react';

// 파일 시스템 API 관련 타입 정의
interface FileWithPath extends File {
  relativePath?: string;
}

// 내장 타입과 충돌하지 않도록 타입 별칭 사용
type FileSystemEntryExt = FileSystemEntry & {
  fullPath?: string;
};

type FileEntryExt = FileSystemFileEntry &
  FileSystemEntryExt & {
    file(
      successCallback: (file: File) => void,
      errorCallback?: (err: DOMException) => void
    ): void;
  };

type DirectoryEntryExt = FileSystemDirectoryEntry & FileSystemEntryExt;

export default function FolderDropComponent() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 폴더의 모든 파일을 재귀적으로 읽는 함수
  const getAllFileEntries = async (
    dataTransferItemList: DataTransferItemList
  ): Promise<FileEntryExt[]> => {
    const fileEntries: FileEntryExt[] = [];
    const queue: FileSystemEntryExt[] = [];

    // 드롭된 모든 아이템을 큐에 추가
    for (let i = 0; i < dataTransferItemList.length; i++) {
      const item = dataTransferItemList[i];
      if (item.kind === 'file') {
        // typescript에서는 webkitGetAsEntry가 기본 타입에 없을 수 있음
        const entry = item.webkitGetAsEntry();
        if (entry) {
          queue.push(entry);
        }
      }
    }

    // 큐를 처리하여 모든 파일 항목 수집
    while (queue.length > 0) {
      const entry = queue.shift()!;

      if (entry.isFile) {
        fileEntries.push(entry as FileEntryExt);
      } else if (entry.isDirectory) {
        // 디렉토리인 경우 해당 디렉토리의 모든 항목을 읽음
        const directoryReader = (entry as DirectoryEntryExt).createReader();

        // readEntries의 프로미스 래퍼
        const readEntriesPromise = (): Promise<FileSystemEntryExt[]> => {
          return new Promise((resolve) => {
            directoryReader.readEntries(
              (entries) => {
                resolve(entries as FileSystemEntryExt[]);
              },
              (error) => {
                console.error('Error reading directory entries:', error);
                resolve([]);
              }
            );
          });
        };

        // 디렉토리 내용 읽기
        // 참고: readEntries는 한 번에 최대 100개 항목만 반환하므로, 항목이 없을 때까지 반복해야 함
        let entries: FileSystemEntryExt[] = [];
        let readBatch: FileSystemEntryExt[] = [];

        do {
          readBatch = await readEntriesPromise();
          entries = entries.concat(readBatch);
        } while (readBatch.length > 0);

        // 읽은 항목들을 큐에 추가
        entries.forEach((entry) => queue.push(entry));
      }
    }

    return fileEntries;
  };

  // 파일 항목을 실제 File 객체로 변환
  const getFileFromEntry = (entry: FileEntryExt): Promise<FileWithPath> => {
    return new Promise((resolve) => {
      entry.file(
        (file) => {
          // 상대 경로 정보 추가
          const fileWithPath = file as FileWithPath;
          fileWithPath.relativePath = entry.fullPath;
          resolve(fileWithPath);
        },
        (error) => {
          console.error('Error getting file from entry:', error);
          // DOMException 에러 핸들링
          resolve({} as FileWithPath);
        }
      );
    });
  };

  const onDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.items) {
      setIsLoading(true);

      try {
        // 모든 파일 항목 가져오기
        const fileEntries = await getAllFileEntries(e.dataTransfer.items);

        // 각 파일 항목을 File 객체로 변환
        const filesData = await Promise.all(
          fileEntries.map((entry) => getFileFromEntry(entry))
        );

        // 빈 파일 객체 필터링 (에러 핸들링에서 생성된 것)
        const validFiles = filesData.filter((file) => file.name);
        setFiles(validFiles);
      } catch (error) {
        console.error('Error processing dropped folder:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        width: '100%',
        height: '300px',
        border: '2px dashed #aaa',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h3>폴더를 여기에 드롭하세요</h3>
      {isLoading ? (
        <p>파일 로딩 중...</p>
      ) : (
        <div style={{ maxHeight: '200px', overflow: 'auto', width: '100%' }}>
          {files.length > 0 ? (
            <ul style={{ textAlign: 'left', padding: '0 20px' }}>
              {files.map((file, index) => (
                <li key={index}>
                  <strong>경로:</strong> {file.relativePath}
                  <br />
                  <strong>이름:</strong> {file.name}
                  <br />
                  <strong>크기:</strong> {(file.size / 1024).toFixed(2)} KB
                  <br />
                  <strong>타입:</strong> {file.type || '폴더'}
                  <hr />
                </li>
              ))}
            </ul>
          ) : (
            <p>아직 드롭된 파일이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
