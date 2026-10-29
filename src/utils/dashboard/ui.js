import { Tooltip } from 'antd';
import style from './dashboard.module.scss';

const cx = (...names) => names.filter(Boolean).join(' ');
const sumOf = items => items.reduce((total, item) => total + (Number(item.value) || 0), 0);

export const formatPercent = (value, total) => (total > 0 ? `${Math.round((value / total) * 1000) / 10}%` : '-');

export const Panel = ({ title, subtitle, extra, className, children }) => (
  <section className={cx(style.panel, className)}>
    {title || extra ? (
      <header className={style.panelHead}>
        <div className={style.panelHeadMain}>
          {title ? <h4 className={style.panelTitle}>{title}</h4> : null}
          {subtitle ? <span className={style.panelSubtitle}>{subtitle}</span> : null}
        </div>
        {extra ? <div className={style.panelExtra}>{extra}</div> : null}
      </header>
    ) : null}
    {children}
  </section>
);

export const Dot = ({ color }) => <span className={style.dot} style={{ background: color }} />;

const toRgba = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const SectionIcon = ({ icon, tone }) => (
  <span className={style.sectionIcon} style={{ '--tone': tone, '--tone-glow': toRgba(tone, 0.24) }}>
    {icon}
  </span>
);

/** state 为需要关注时的状态色，卡片据此着色；正常时保持白底 */
const stateStyle = state => (state ? { '--state': state, '--state-bg': toRgba(state, 0.07), '--state-border': toRgba(state, 0.28) } : undefined);

export const Metric = ({ label, value, hint, color, card, state, size, segments, children }) => (
  <div
    className={cx(style.metric, size === 'large' && style.metricLarge, card && style.metricCard, state && style.metricCardState)}
    style={stateStyle(state)}
  >
    <div className={style.metricLabel}>
      {color ? <Dot color={color} /> : null}
      {label}
    </div>
    <div className={style.metricValue}>{value}</div>
    {segments ? (
      <>
        <StackBar items={segments} height={4} />
        <div className={style.metricLegend}>
          {segments.map(item => (
            <span key={item.key}>
              <Dot color={item.color} />
              {item.label}
              <b>{item.display ?? item.value.toLocaleString()}</b>
            </span>
          ))}
        </div>
      </>
    ) : hint ? (
      <div className={style.metricHint}>{hint}</div>
    ) : null}
    {children}
  </div>
);

/** 迷你趋势线：null 视为缺失点，前后有效点直接相连 */
export const Sparkline = ({ values, color, height = 32 }) => {
  const points = values.map((v, i) => (v == null || !Number.isFinite(Number(v)) ? null : [i, Number(v)])).filter(Boolean);
  if (points.length < 2) return <div className={style.sparkline} style={{ height }} />;
  const ys = points.map(([, y]) => y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const lastIndex = Math.max(values.length - 1, 1);
  const coords = points.map(([x, y]) => [(x / lastIndex) * 100, 28 - ((y - min) / span) * 24]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(2)},32 L${coords[0][0].toFixed(2)},32 Z`;
  return (
    <svg className={style.sparkline} style={{ height }} viewBox="0 0 100 32" preserveAspectRatio="none">
      <path d={area} fill={color} fillOpacity={0.08} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
};

export const StackBar = ({ items, height = 8 }) => {
  const total = sumOf(items);
  return (
    <div className={style.stackBar} style={{ height }}>
      {items
        .filter(item => item.value > 0)
        .map(item => (
          <Tooltip key={item.key} title={`${item.label} ${item.display ?? item.value.toLocaleString()} · ${formatPercent(item.value, total)}`}>
            <span className={style.stackBarSegment} style={{ flexGrow: item.value, background: item.color }} />
          </Tooltip>
        ))}
    </div>
  );
};

export const Legend = ({ items, inline }) => {
  const total = sumOf(items);
  return (
    <ul className={cx(style.legend, inline && style.legendInline)}>
      {items.map(item => (
        <li key={item.key} className={style.legendItem}>
          <Dot color={item.color} />
          <span className={style.legendLabel}>{item.label}</span>
          <span className={style.legendValue}>{item.value.toLocaleString()}</span>
          {inline ? null : <span className={style.legendPercent}>{formatPercent(item.value, total)}</span>}
        </li>
      ))}
    </ul>
  );
};

export const RankList = ({ items, emptyText }) => {
  if (items.length === 0) return <div className={style.empty}>{emptyText}</div>;
  const total = sumOf(items);
  const max = Math.max(...items.map(item => item.value), 1);
  return (
    <ul className={style.rankList}>
      {items.map(item => (
        <li key={item.key} className={style.rankItem}>
          <div className={style.rankRow}>
            <span className={style.rankLabel} title={item.label}>
              {item.label}
            </span>
            <span className={style.rankValue}>{item.value.toLocaleString()}</span>
            <span className={style.rankPercent}>{formatPercent(item.value, total)}</span>
          </div>
          <div className={style.barTrack}>
            <span className={style.barFill} style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

/** 按任务类型的平均耗时：等待 + 执行两段拼成一条，长度按最长的平均总耗时归一 */
export const DurationList = ({ items, waitingLabel, executionLabel, waitingColor, executionColor, format, countText, emptyText }) => {
  if (items.length === 0) return <div className={style.empty}>{emptyText}</div>;
  const max = Math.max(...items.map(item => item.waiting + item.execution), 1);
  return (
    <ul className={style.durationList}>
      {items.map(item => (
        <li key={item.key} className={style.durationItem}>
          <div className={style.durationHead}>
            <span className={style.rankLabel} title={item.label}>
              {item.label}
            </span>
            <span className={style.durationTotal}>{format(item.waiting + item.execution)}</span>
          </div>
          <div className={style.durationTrack}>
            <span style={{ width: `${(item.waiting / max) * 100}%`, background: waitingColor }} />
            <span style={{ width: `${(item.execution / max) * 100}%`, background: executionColor }} />
          </div>
          <div className={style.durationMeta}>
            <span>
              <Dot color={waitingColor} />
              {waitingLabel} {format(item.waiting)}
            </span>
            <span>
              <Dot color={executionColor} />
              {executionLabel} {format(item.execution)}
            </span>
            {item.count ? <span className={style.durationCount}>{countText(Math.round(item.count))}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
};

const HEAT_ALPHAS = [0.16, 0.36, 0.62, 1];

/** 星期 × 小时热力图：上方为每小时合计，右侧为每天合计；values[row][col] 为数字 */
export const Heatmap = ({ values, rowLabels, columnLabels, labelStep, color, peak, renderTooltip, lessText, moreText }) => {
  const max = Math.max(1, ...values.flat());
  const levelOf = v => (v > 0 ? Math.min(HEAT_ALPHAS.length - 1, Math.ceil((v / max) * HEAT_ALPHAS.length) - 1) : -1);
  const columnTotals = columnLabels.map((_, col) => values.reduce((n, row) => n + row[col], 0));
  const rowTotals = values.map(row => row.reduce((n, v) => n + v, 0));
  const columnMax = Math.max(1, ...columnTotals);
  const rowMax = Math.max(1, ...rowTotals);
  const peakColumn = columnTotals.indexOf(Math.max(...columnTotals));
  const gridStyle = { gridTemplateColumns: `auto repeat(${columnLabels.length}, minmax(0, 1fr)) auto` };

  return (
    <div className={style.heatmap}>
      <div className={style.heatmapGrid} style={gridStyle}>
        <span />
        {columnTotals.map((total, col) => (
          <Tooltip key={col} title={`${columnLabels[col]} · ${total.toLocaleString()}`}>
            <span className={style.heatmapColumn}>
              <span
                className={style.heatmapColumnBar}
                style={{
                  height: `${(total / columnMax) * 100}%`,
                  background: total > 0 && col === peakColumn ? color : toRgba(color, 0.32)
                }}
              />
            </span>
          </Tooltip>
        ))}
        <span />

        {values.map((row, rowIndex) => (
          <div key={rowIndex} className={style.heatmapRow}>
            <span className={style.heatmapRowLabel}>{rowLabels[rowIndex]}</span>
            {row.map((value, col) => {
              const level = levelOf(value);
              const isPeak = peak && peak.row === rowIndex && peak.col === col;
              return (
                <Tooltip key={col} title={renderTooltip(rowIndex, col)} mouseEnterDelay={0}>
                  <span
                    className={cx(style.heatmapCell, isPeak && style.heatmapCellPeak)}
                    style={level >= 0 ? { background: toRgba(color, HEAT_ALPHAS[level]), '--heat-color': color } : { '--heat-color': color }}
                  />
                </Tooltip>
              );
            })}
            <span className={style.heatmapRowTotal}>
              <span className={style.heatmapRowTrack}>
                <span className={style.heatmapRowFill} style={{ width: `${(rowTotals[rowIndex] / rowMax) * 100}%`, background: color }} />
              </span>
              {rowTotals[rowIndex].toLocaleString()}
            </span>
          </div>
        ))}

        <span />
        {columnLabels.map((label, col) => (
          <span key={col} className={style.heatmapAxisLabel}>
            {col % labelStep === 0 ? label.slice(0, 2) : ''}
          </span>
        ))}
        <span />
      </div>
      <div className={style.heatmapLegend}>
        {lessText}
        <span className={style.heatmapCell} />
        {HEAT_ALPHAS.map(alpha => (
          <span key={alpha} className={style.heatmapCell} style={{ background: toRgba(color, alpha) }} />
        ))}
        {moreText}
      </div>
    </div>
  );
};

export const LiveBadge = ({ connected, text, time }) => (
  <span className={cx(style.live, connected && style.liveOn)}>
    <span className={style.liveDot} />
    {text}
    {time ? <span className={style.liveTime}>{time}</span> : null}
  </span>
);
