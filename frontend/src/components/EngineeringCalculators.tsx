import { useState } from 'react';
import type { CalculatorId } from '../types';

export function EngineeringCalculator({ id }: { id: CalculatorId }) {
  if (id === 'three-phase-current') return <ThreePhaseCurrentCalculator />;
  if (id === 'voltage-drop') return <VoltageDropCalculator />;
  return <TransformerCurrentCalculator />;
}

function ThreePhaseCurrentCalculator() {
  const [power, setPower] = useState(37);
  const [voltage, setVoltage] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.86);
  const [efficiency, setEfficiency] = useState(0.92);
  const current = positive(power, voltage, powerFactor, efficiency) ? power * 1000 / (Math.sqrt(3) * voltage * powerFactor * efficiency) : NaN;
  return <CalculatorShell title="Three-Phase Motor Current" formula="I = P / (√3 × V × η × PF)" result={format(current, 'A')}>
    <NumberField label="Motor output power" unit="kW" value={power} setValue={setPower} />
    <NumberField label="Line-to-line voltage" unit="V" value={voltage} setValue={setVoltage} />
    <NumberField label="Power factor" unit="decimal" value={powerFactor} setValue={setPowerFactor} step="0.01" />
    <NumberField label="Efficiency" unit="decimal" value={efficiency} setValue={setEfficiency} step="0.01" />
  </CalculatorShell>;
}

function VoltageDropCalculator() {
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const [current, setCurrent] = useState(80);
  const [length, setLength] = useState(0.12);
  const [resistance, setResistance] = useState(0.30);
  const [reactance, setReactance] = useState(0.08);
  const [voltage, setVoltage] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const valid = positive(current, length, voltage, powerFactor) && resistance >= 0 && reactance >= 0 && powerFactor <= 1;
  const sinPhi = valid ? Math.sqrt(1 - powerFactor ** 2) : NaN;
  const factor = phase === 'single' ? 2 : Math.sqrt(3);
  const drop = valid ? factor * current * length * (resistance * powerFactor + reactance * sinPhi) : NaN;
  const percentage = valid ? drop / voltage * 100 : NaN;
  return <CalculatorShell title="AC Voltage Drop" formula={`${phase === 'single' ? '1φ: 2' : '3φ: √3'} × I × L × (R cosφ + X sinφ)`} result={`${format(drop, 'V')} · ${format(percentage, '%')}`}>
    <label className="calculator-field"><span>System</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
    <NumberField label="Current" unit="A" value={current} setValue={setCurrent} />
    <NumberField label="One-way length" unit="km" value={length} setValue={setLength} step="0.01" />
    <NumberField label="Resistance" unit="Ω/km" value={resistance} setValue={setResistance} step="0.01" />
    <NumberField label="Reactance" unit="Ω/km" value={reactance} setValue={setReactance} step="0.01" />
    <NumberField label="System voltage" unit="V" value={voltage} setValue={setVoltage} />
    <NumberField label="Power factor" unit="decimal" value={powerFactor} setValue={setPowerFactor} step="0.01" />
  </CalculatorShell>;
}

function TransformerCurrentCalculator() {
  const [rating, setRating] = useState(500);
  const [voltage, setVoltage] = useState(400);
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const current = positive(rating, voltage) ? rating * 1000 / ((phase === 'three' ? Math.sqrt(3) : 1) * voltage) : NaN;
  return <CalculatorShell title="Transformer Rated Current" formula={phase === 'three' ? 'I = S / (√3 × V)' : 'I = S / V'} result={format(current, 'A')}>
    <NumberField label="Transformer rating" unit="kVA" value={rating} setValue={setRating} />
    <NumberField label="Winding voltage" unit="V" value={voltage} setValue={setVoltage} />
    <label className="calculator-field"><span>Phase</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
  </CalculatorShell>;
}

function CalculatorShell({ title, formula, result, children }: { title: string; formula: string; result: string; children: React.ReactNode }) {
  return <div className="calculator-panel">
    <header><div><span>INTERACTIVE ENGINEERING CALCULATION</span><h3>{title}</h3></div><code>{formula}</code></header>
    <div className="calculator-grid">{children}</div>
    <output className="calculator-result" aria-live="polite"><span>Calculated result</span><strong>{result}</strong></output>
    <p>Engineering calculation only. Final conductor and protection selections must follow the selected standard and verified project inputs.</p>
  </div>;
}

function NumberField({ label, unit, value, setValue, step = 'any' }: { label: string; unit: string; value: number; setValue: (value: number) => void; step?: string }) {
  return <label className="calculator-field"><span>{label}</span><div><input aria-label={`${label} (${unit})`} type="number" min="0" step={step} value={value} onChange={(event) => setValue(event.currentTarget.valueAsNumber)} /><em>{unit}</em></div></label>;
}

const positive = (...values: number[]) => values.every((value) => Number.isFinite(value) && value > 0);
const format = (value: number, unit: string) => Number.isFinite(value) ? `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${unit}` : `Enter valid inputs`;
