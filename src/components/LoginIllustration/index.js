import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import style from './style.module.scss';

const resource = {
  hello: () => import('./Hello').then(module => module.default)
};

const LoginIllustration = ({ type, className, ...props }) => {
  return (
    <div className={style['login-illustration']}>
      <Fetch
        loader={({ params }) => (resource[params.type] || resource.hello)()}
        params={{ type }}
        render={({ data: Player }) => {
          return <Player {...props} />;
        }}
      />
    </div>
  );
};

export default LoginIllustration;
