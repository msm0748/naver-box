import { Container } from '@chakra-ui/react';
// import FolderDropComponent from './components/FolderDropComponent';
import ReactDropzone from './components/ReactDropzone';

function App() {
  return (
    <Container h="100dvh">
      {/* <FolderDropComponent /> */}
      <ReactDropzone />
    </Container>
  );
}

export default App;
