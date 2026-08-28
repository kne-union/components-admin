import { createWithRemoteLoader } from '@kne/remote-loader';
import classnames from 'classnames';
import blurredHalo from './assets/cluster-blurred-halo.svg';
import cyanHalo from './assets/cluster-cyan-halo.svg';
import sparkles from './assets/sparkles.svg';
import { CARD_LAYOUT, CONTENT, resolveContentKey } from './content';
import style from './style.module.scss';

const Workforce = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalValue']
})(({ remoteModules }) => {
  const [useGlobalValue] = remoteModules;
  const locale = useGlobalValue('locale');
  const contentKey = resolveContentKey(locale);
  const content = CONTENT[contentKey];
  const subtitleLines = Array.isArray(content.subtitle) ? content.subtitle : [content.subtitle];

  return (
    <div className={style.container}>
      <div className={style['title-layer']}>
        <p className={style.title}>{content.title}</p>
        <div className={style.subtitle}>
          {subtitleLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div className={style.visual}>
        <img className={style['halo-blurred']} src={blurredHalo} alt="" aria-hidden />
        <img className={style['halo-cyan']} src={cyanHalo} alt="" aria-hidden />
        <div className={style['signal-beam']} aria-hidden />

        {CARD_LAYOUT.map((card, index) => (
          <div
            key={card.position}
            className={classnames(style.card, style[`card-${card.variant}`], style[`card-${card.position}`])}>
            <p className={style['card-title']}>{content.cardTitles[index]}</p>
            <div className={style['card-lines']}>
              {Array.from({ length: card.lines }).map((_, lineIndex) => (
                <span
                  key={lineIndex}
                  className={classnames(style['skeleton-line'], lineIndex === 1 && style['skeleton-line-short'])}
                />
              ))}
            </div>
          </div>
        ))}

        <div className={style['quote-card']}>
          <div className={style['quote-icon']}>
            <span className={style['quote-mark']}>&ldquo;</span>
          </div>
          <p className={style['quote-text']}>{content.quote}</p>
        </div>

        <img className={style.sparkles} src={sparkles} alt="" aria-hidden />
      </div>
    </div>
  );
});

export default Workforce;
