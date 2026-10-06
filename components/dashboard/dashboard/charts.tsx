'use client';

import { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TrendPoint } from '@/lib/types/dashboard';
import { formatCompactNPR, formatNPR, formatNumber } from '../format';

// Chart chrome follows the dataviz spec: one brand hue per chart, hairline
// solid gridlines, recessive axes, text in ink tokens (never the series color).
const SERIES = 'var(--chart-1)';
const GRID = 'var(--chart-grid)';
const AXIS = 'var(--chart-axis)';
const TICK = { fill: AXIS, fontSize: 12 };

type TipRow = { label: string; value: string };

function TooltipCard({ title, rows }: { title: ReactNode; rows: TipRow[] }) {
  return (
    <div className='min-w-36 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg'>
      <p className='mb-1.5 font-medium text-foreground'>{title}</p>
      {rows.map(row => (
        <div key={row.label} className='flex items-center justify-between gap-4'>
          <span className='flex items-center gap-1.5 text-muted-foreground'>
            <span
              className='size-2 rounded-full'
              style={{ background: SERIES }}
              aria-hidden
            />
            {row.label}
          </span>
          <span className='font-medium tabular-nums text-foreground'>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Visually hidden table so every plotted value is reachable without hover. */
function SrTable({
  caption,
  headers,
  rows
}: {
  caption: string;
  headers: [string, string];
  rows: [string, string][];
}) {
  return (
    <table className='sr-only'>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope='col'>{headers[0]}</th>
          <th scope='col'>{headers[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a}>
            <th scope='row'>{a}</th>
            <td>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type LabelProps = {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
  value?: unknown;
};

/** Single-line category label (Recharts wraps long ticks by default). */
function CategoryTick(props: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const value = props.payload?.value ?? '';
  const text = value.length > 22 ? `${value.slice(0, 21)}…` : value;
  return (
    <text
      x={props.x}
      y={props.y}
      dx={-8}
      textAnchor='end'
      dominantBaseline='central'
      fill='var(--foreground)'
      fontSize={12}
    >
      <title>{value}</title>
      {text}
    </text>
  );
}

type TipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown; payload?: Record<string, unknown> }>;
};

export function RevenueChart({ data }: { data: TrendPoint[] }) {
  return (
    <>
      <div className='h-72 w-full' aria-hidden>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey='label'
              tick={TICK}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              minTickGap={24}
              tickMargin={8}
            />
            <YAxis
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              tickFormatter={formatCompactNPR}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              content={({ active, payload }: TipProps) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={String(payload[0].payload!.label)}
                    rows={[
                      { label: 'Revenue', value: formatNPR(Number(payload[0].value)) },
                      {
                        label: 'Orders',
                        value: formatNumber(Number(payload[0].payload!.orders))
                      }
                    ]}
                  />
                ) : null
              }
            />
            <Bar
              dataKey='revenue'
              isAnimationActive={false}
              fill={SERIES}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption='Revenue by period'
        headers={['Period', 'Revenue']}
        rows={data.map(d => [d.label, formatNPR(d.revenue)])}
      />
    </>
  );
}

export function OrdersChart({ data }: { data: TrendPoint[] }) {
  return (
    <>
      <div className='h-56 w-full' aria-hidden>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey='label'
              tick={TICK}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              minTickGap={24}
              tickMargin={8}
            />
            <YAxis
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              content={({ active, payload }: TipProps) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={String(payload[0].payload!.label)}
                    rows={[
                      { label: 'Orders', value: formatNumber(Number(payload[0].value)) }
                    ]}
                  />
                ) : null
              }
            />
            <Bar
              dataKey='orders'
              isAnimationActive={false}
              fill={SERIES}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption='Orders by period'
        headers={['Period', 'Orders']}
        rows={data.map(d => [d.label, formatNumber(d.orders)])}
      />
    </>
  );
}

/** Horizontal bars with the value printed at the tip. */
export function HorizontalBars({
  data,
  valueFormatter,
  caption,
  valueLabel
}: {
  data: { name: string; value: number }[];
  valueFormatter: (_value: number) => string;
  caption: string;
  valueLabel: string;
}) {
  const height = Math.max(data.length * 40, 120);
  return (
    <>
      <div style={{ height }} className='w-full' aria-hidden>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            layout='vertical'
            margin={{ top: 0, right: 72, left: 0, bottom: 0 }}
            barCategoryGap={10}
          >
            <XAxis type='number' hide domain={[0, 'dataMax']} />
            <YAxis
              type='category'
              dataKey='name'
              tick={CategoryTick}
              tickLine={false}
              axisLine={false}
              width={164}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              content={({ active, payload }: TipProps) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={String(payload[0].payload!.name)}
                    rows={[
                      { label: valueLabel, value: valueFormatter(Number(payload[0].value)) }
                    ]}
                  />
                ) : null
              }
            />
            <Bar
              dataKey='value'
              isAnimationActive={false}
              fill={SERIES}
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
              minPointSize={2}
            >
              <LabelList
                dataKey='value'
                content={(props: LabelProps) => (
                  <text
                    x={Number(props.x) + Number(props.width) + 8}
                    y={Number(props.y) + Number(props.height) / 2}
                    dominantBaseline='central'
                    fill='var(--foreground)'
                    fontSize={12}
                    fontWeight={500}
                  >
                    {valueFormatter(Number(props.value))}
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable
        caption={caption}
        headers={['Item', valueLabel]}
        rows={data.map(d => [d.name, valueFormatter(d.value)])}
      />
    </>
  );
}

