# React와 History API 사용하여 SPA Router 기능 구현하기

# 1. 요구 사항. 
**1) 해당 주소로 진입했을 때 아래 주소에 맞는 페이지가 렌더링 되어야 한다.**

- `/` → `root` 페이지
- `/about` → `about` 페이지

**2) 버튼을 클릭하면 해당 페이지로, 뒤로 가기 버튼을 눌렀을 때 이전 페이지로 이동해야 한다.**

- 힌트) `window.onpopstate`, `window.location.pathname` History API(`pushState`)

**3) Router, Route 컴포넌트를 구현해야 하며, 형태는 아래와 같아야 한다.**

```tsx
ReactDOM.createRoot(container).render(
  <Router>
    <Route path="/" component={<Root />} />
    <Route path="/about" component={<About />} />
  </Router>
);
```

**4) 최소한의 push 기능을 가진 useRouter Hook을 작성한다.**
```tsx
const { push } = useRouter();
```


# 2. 구현 코드 및 내용.
**1) Router.tsx**

Router.tsx 코드는 Route를 감싸는 부모 컴포넌트로서, 현재 페이지의 전체적인 path를 관리하는 프로바이더 역할을 해줘야 한다.

따라서, 아래처럼 먼저, 리액트의 컨텍스트를 활용하려고 했다.  

이후, 유즈스테이트로 현재 주소창이 어디를 가리키고 있는 지를 알려주는 상태 값을 하나 지정했다. 
추가로, useEffect 안쪽에서 window 함수들로 구성된 브라우저 HistoryAPI(popstate, window.location.pathname)를 통해 현재 현재 브라우저가 나타내는 주소 창의 
path를 받아서 유즈 스테이트에 업데이트시켜줬다.

마지막으로 업데이트 된 path 값 들을 아래처럼 RouterContext.Provider value={{ currentPath: path }} 에 전달해 준다. 
이렇게 하면, 현재 Router 컴포넌트 밑에 연결된 전체 자식 컴포넌트들은 해당 요소들을 전달 받아서 활용 가능하다. 

```tsx

export const RouterContext = React.createContext<RouterContextData>({
  currentPath: '',
});

const Router: React.FC<RouterProps> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath: path }}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;

```

**2) Route.tsx**

Route.tsx 코드는 Router 컴포넌트 들의 자식 컴포넌트들이다.
따라서, 아래처럼 코드를 작성하였다. 

자세히 살펴보면, 

1. path와, 페이지 컴포넌트를 프롭스로 받는다.
2. const { currentPath } = useContext(RouterContext); -> 다만, 여기서 다른 점은 위에서 선언한 콘텍스트 api를 활용한다.
3. 즉, 부모의 currentPath와 자식의 프롭으로 전달 받은 path가 일치하는 지 여부를 따진다. ->  const pathMatch = new RegExp(`^${path}$`).test(currentPath);
4. 따져서 만약 맞다면 프롭으로 전달 받은 해당 페이지 컴포넌트를 띄우고 아니면 null이 들어온다. 


```tsx

import React, { ReactNode, useContext } from 'react';
import { RouterContext } from './Router';

interface RouteProps {
  path: string;
  component: ReactNode;
}

const Route: React.FC<RouteProps> = ({ path, component: Component }) => {
  const { currentPath } = useContext(RouterContext);
  const pathMatch = new RegExp(`^${path}$`).test(currentPath);

  return pathMatch ? Component : null;
};

export default Route;


```

**3) useRouter.ts**

useRouter 훅은 사용자가 버튼 클릭 시에 이동하는 로직을 작성한 훅이다. 

자세히 살펴보면, 

1) window.history.pushState({}, '', path)
이 코드는 브라우저의 History API의 pushState 메서드를 사용하여 현재 브라우저 세션의 히스토리 스택에 새로운 항목을 추가.
첫 번째 인수 {}는 state 객체로, 현재 히스토리 엔트리에 저장된 상태 객체. 여기서는 빈 객체를 전달하여 기본 상태를 전달하여 이전 상태를 유지.
두 번째 인수 ''는 제목(title). 일부 브라우저에서는 이를 무시. 여기서는 빈 문자열을 전달하여 제목을 기본 값으로 유지.
세 번째 인수 path는 추가할 URL. 브라우저 주소 표시줄에 표시되는 경로.

따러서 여기서는 path를 바깥 사용하는 쪽에서 받아서 해당 path로 이동하도록 하는 것.

2) window.dispatchEvent(new PopStateEvent('popstate'))
이 코드는 브라우저에서 사용자 정의 이벤트를 생성하고 실행하는 작업. new PopStateEvent('popstate')는 popstate 이벤트를 생성.
window.dispatchEvent() 메서드는 생성된 이벤트를 윈도우 오브젝트에 DISPATCH(realize)하여 이벤트가 실제로 적용.


요약 정리: 
위의 코드는 현재브라우저 히스토리 스택에 path를 추가하고, 이벤트를 실행하여 구성 요소의 상태를 업데이트. 
이 방법으로 사용자가 브라우저의 뒤로/앞으로 버튼을 사용할 때 애플리케이션 내 이동이 올바르게 처리함.


```tsx

import { useCallback } from 'react';

const useRouter = () => {
  const push = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return {
    push,
  };
};

export default useRouter;

```

**4) 코드 사용 부분.** 
1) App.tsx
```tsx
import Route from '@components/common/Route';
import Router from '@components/common/Router';
import { About } from '@pages/About';
import { Root } from '@pages/Root';

function App() {
  return (
    <Router>
      <Route path={'/'} component={<Root />} />
      <Route path={'/about'} component={<About />} />
    </Router>
  );
}
export default App;
```



2) About.tsx

```tsx
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
```

위 처럼 해당 컴포넌트와 커스텀 훅을 직접 사용함. 

# 3. 구현 후, 느낀 점. 

평소 react-router-dom 을 통해서 처리해서 비교적 쉽게만 알던 부분을 사용하지 않고 직접 구현해 보니 생각보다 많은 것을 느낄 수 있었다. 

1. 처음에는 당황스러웠지만, 브라우저의 동작원리와 어떻게 접근하면 되는 것인지 보다 더 잘 알 수 있었다.
2. 특히, window의 historyApi를 더 잘 이해하게 되었으며, 사실 react-router-dom 쪽도 뜯어보면 이런 구조일 거 같다는 생각에 근본이 역시 중요하다는 것을 다시 느꼈다.
3. 앞으로도 어떤 기술을 쓰더라도, 그냥 쓰는 것이 아닌 조금 더 근본에 대한 탐구를 더 해보고 써야겠다.  



### 참고) **Vite 초기 세팅 ([링크](https://vitejs-kr.github.io/guide/#scaffolding-your-first-vite-project))**

```bash
$> yarn create vite
# 실행 후 cli의 지시에 따라 react, react-ts 중 택일하여 초기 세팅할 것
```

- https://vitejs-kr.github.io/guide/#scaffolding-your-first-vite-project
- Vite란?
    - 프랑스어로 ‘빠르다’는 뜻을 가진 자바스크립트 빌드 툴
    - 프로젝트 스캐폴딩 템플릿 지원하고, 설정이 매우 간단함(거의 불필요함)
    - CRA에 비해 프로젝트에 담긴 의존성 규모가 작아서 인스톨 시간에 대한 부담이 없음
    - **HMR 및 빌드 속도가 매우 빠름**
