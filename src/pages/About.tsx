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

export const About = () => {
  const { push } = useRouter();
  const handleClick = () => {
    push('/');
  };

  return (
    <Container>
      <h1>About</h1>
      <button onClick={handleClick}>
        <a>go main</a>
      </button>
    </Container>
  );
};
