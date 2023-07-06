import useRouter from '@hooks/useRouter';
import { styled } from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

export const Root = () => {
  const { push } = useRouter();
  const handleClick = () => {
    push('/about');
  };

  return (
    <Container>
      <h1>root</h1>
      <button onClick={handleClick}>
        <a>about</a>
      </button>
    </Container>
  );
};
