"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Bookmark, Calculator, Check, CreditCard, History, Info, LockKeyhole, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { analyzeLoan, amortization, creditBand, rupees, sampleInputs, validateInputs, type LoanInputs } from "@/lib/finance";

type Tab = "planner" | "credit" | "emi" | "insights" | "saved";
type Saved = { id: string; label: string; inputs: LoanInputs; createdAt: number };
const percent = (value: number) => `${Math.round(value * 100)}%`;
const savedKey = "loanlens-scenarios-v1";
const staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

function NumberField({ label, value, onChange, unit, min = 0, max, step = 1, note }: {
  label: string; value: number | null; onChange: (value: number | null) => void;
  unit?: string; min?: number; max?: number; step?: number; note?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div className="number-field"><label htmlFor={id}>{label}</label><div className="number-wrap">
    {unit === "₹" && <span className="unit-prefix" aria-hidden="true">₹</span>}
    <Input id={id} type="number" inputMode="decimal" min={min} max={max} step={step}
      value={value ?? ""} placeholder={value === null ? "Optional" : undefined}
      onChange={event => onChange(event.target.value === "" ? null : Number(event.target.value))}
      className={`field-input ${unit === "₹" ? "with-prefix" : ""}`} />
    {unit && unit !== "₹" && <span className="unit-suffix" aria-hidden="true">{unit}</span>}
  </div>{note && <p className="field-note">{note}</p>}</div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("planner");
  const [inputs, setInputs] = useState<LoanInputs>(sampleInputs);
  const [baseline, setBaseline] = useState<LoanInputs>(sampleInputs);
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [name, setName] = useState("");
  const [sync, setSync] = useState(false);
  const [connection, setConnection] = useState({ claude: false, sheets: false });
  const [notice, setNotice] = useState("");
  const [recordError, setRecordError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const analysis = useMemo(() => {
    try { return { data: analyzeLoan(validateInputs(inputs)), error: "" }; }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : "Check your inputs." }; }
  }, [inputs]);
  const result = analysis.data;
  const pinned = analyzeLoan(baseline);
  const schedule = useMemo(() => result ? amortization(inputs) : [], [inputs, result]);
  const scoreContext = creditBand(inputs.creditScore);
  const update = (key: keyof LoanInputs, value: string | number | null) => {
    setInputs(previous => ({ ...previous, [key]: value })); setAiText(""); setAiError("");
  };

  useEffect(() => {
    let id = localStorage.getItem("loanlens-device-token");
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) { id = crypto.randomUUID(); localStorage.setItem("loanlens-device-token", id); }
    setToken(id);
    if (!staticExport) fetch("/api/status").then(r => r.json()).then(d => { const status = d as { claude?: boolean; sheets?: boolean }; setConnection({ claude: !!status.claude, sheets: !!status.sheets }); }).catch(() => {});
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true); setRecordError("");
    try {
      const rows = JSON.parse(localStorage.getItem(savedKey) || "[]") as Saved[];
      if (!Array.isArray(rows)) throw new Error("Saved plans could not be read.");
      setSaved(rows.slice(0, 30));
    } catch (error) { setRecordError(error instanceof Error ? error.message : "Unable to load plans."); }
    finally { setLoadingHistory(false); }
  };
  const navigate = (value: Tab) => { setTab(value); if (value === "saved") void loadHistory(); };
  const save = async () => {
    if (!result) return;
    setNotice(""); setRecordError("");
    try {
      const scenario: Saved = { id: crypto.randomUUID(), label: (name.trim() || `Plan ${saved.length + 1}`).slice(0, 48), inputs: validateInputs(inputs), createdAt: Date.now() };
      const existing = JSON.parse(localStorage.getItem(savedKey) || "[]") as Saved[];
      const next = [scenario, ...(Array.isArray(existing) ? existing : [])].slice(0, 30);
      localStorage.setItem(savedKey, JSON.stringify(next)); setSaved(next); setName("");
      if (sync && connection.sheets) {
        try {
          const response = await fetch("/api/sheet-sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(scenario) });
          if (!response.ok) throw new Error("Sheet unavailable");
          setNotice("Saved on this device and synced to your sheet.");
        } catch { setNotice("Saved on this device. Sheet sync was unavailable."); }
      } else setNotice("Plan saved on this device.");
    } catch (error) { setRecordError(error instanceof Error ? error.message : "Unable to save plan."); }
  };
  const remove = async (id: string) => {
    try {
      const next = saved.filter(item => item.id !== id);
      localStorage.setItem(savedKey, JSON.stringify(next)); setSaved(next);
    } catch (error) { setRecordError(error instanceof Error ? error.message : "Unable to delete plan."); }
  };
  const askClaude = async () => {
    if (!result || staticExport) return;
    setAiLoading(true); setAiText(""); setAiError("");
    try {
      const response = await fetch("/api/insights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(inputs) });
      const data = await response.json() as { error?: string; text: string };
      if (!response.ok) throw new Error(data.error || "Could not get guidance.");
      setAiText(data.text);
    } catch (error) { setAiError(error instanceof Error ? error.message : "Could not get guidance."); }
    finally { setAiLoading(false); }
  };

  return <div className="app-shell"><header className="topbar"><div className="topbar-inner"><div className="brand"><span className="brand-mark"><Activity size={22} /></span>loanlens<span className="brand-dot">.</span><small>AI</small></div><div className="topbar-right"><span className="demo-pill"><i /> Educational simulator</span><span className="topbar-label"><LockKeyhole size={15} /> Personal workspace</span></div></div></header>
    <div className="workspace"><aside className="side-rail" aria-label="Financial tools"><div className="rail-caption">WORKSPACE</div>{([
      ["planner", SlidersHorizontal, "Loan planner"], ["credit", CreditCard, "Credit context"], ["emi", Calculator, "EMI breakdown"], ["insights", Sparkles, "Financial tips"], ["saved", History, "Saved plans"],
    ] as const).map(([value, Icon, label]) => <button key={value} className={`rail-link ${tab === value ? "selected" : ""}`} onClick={() => navigate(value)}><Icon size={18} />{label}</button>)}<div className="rail-bottom"><ShieldCheck size={18} /><p>Your numbers stay here until you choose to save a plan.</p></div></aside>
      <main className="main-column"><div className="page-intro"><div><div className="eyebrow"><span /> FINANCIAL PLANNING STUDIO</div><h1>See the full picture <em>before you borrow.</em></h1><p>Explore your monthly payment, credit context, and ways to adjust a loan plan.</p></div><div className="intro-badge"><b>01</b><span>LIVE ANALYSIS<small>Updates as you edit</small></span><Activity size={19} /></div></div>
        <Tabs value={tab} onValueChange={value => navigate(value as Tab)} className="workspace-tabs"><TabsList className="mobile-tabs" aria-label="Financial tools"><TabsTrigger value="planner">Planner</TabsTrigger><TabsTrigger value="credit">Credit</TabsTrigger><TabsTrigger value="emi">EMI</TabsTrigger><TabsTrigger value="insights">Tips</TabsTrigger><TabsTrigger value="saved">Saved</TabsTrigger></TabsList>

          <TabsContent value="planner" className="tab-panel"><div className="planner-grid"><section className="panel input-panel" aria-labelledby="inputs-title"><div className="panel-heading"><div><div className="section-kicker">YOUR INPUTS</div><h2 id="inputs-title">Build your loan plan</h2></div><button className="text-button" onClick={() => setInputs(sampleInputs)}><RotateCcw size={15} /> Reset</button></div><p className="sample-note"><Info size={16} /> Sample figures are loaded. Replace them with your own estimates.</p><div className="form-section-title"><span>01</span> Borrowing details</div><div className="field-grid"><NumberField label="Loan amount" value={inputs.loanAmount} onChange={v => update("loanAmount", v ?? 0)} unit="₹" min={1000} max={100000000} /><NumberField label="Interest rate" value={inputs.annualRate} onChange={v => update("annualRate", v ?? 0)} unit="% p.a." min={0} max={40} step={0.1} /><NumberField label="Tenure" value={inputs.tenureMonths} onChange={v => update("tenureMonths", v ?? 0)} unit="months" min={1} max={360} /><NumberField label="Monthly income" value={inputs.monthlyIncome} onChange={v => update("monthlyIncome", v ?? 0)} unit="₹" min={1} /></div><div className="form-section-title second"><span>02</span> Your situation</div><div className="field-grid"><NumberField label="Existing monthly EMIs" value={inputs.existingEmi} onChange={v => update("existingEmi", v ?? 0)} unit="₹" /><NumberField label="Age" value={inputs.age} onChange={v => update("age", v ?? 0)} unit="years" min={18} max={80} /><div className="number-field"><label htmlFor="employment-type">Employment</label><Select value={inputs.employment} onValueChange={v => update("employment", v)}><SelectTrigger id="employment-type" className="field-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="salaried">Salaried</SelectItem><SelectItem value="self-employed">Self-employed</SelectItem><SelectItem value="student">Student</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div><NumberField label="Work experience" value={inputs.experienceYears} onChange={v => update("experienceYears", v ?? 0)} unit="years" step={0.5} /></div><div className="score-row"><NumberField label="Credit score (optional)" value={inputs.creditScore} onChange={v => update("creditScore", v)} min={300} max={900} note="Enter a score from your own report. We cannot fetch or verify it." /></div>{analysis.error && <p className="inline-error" role="alert">{analysis.error}</p>}</section>
            <section className="panel result-panel" aria-labelledby="result-title"><div className="result-top"><span className="section-kicker">LIVE ESTIMATE</span><span className="live-chip"><i /> Based on your inputs</span></div><h2 id="result-title">Your monthly picture</h2>{result ? <><div className="hero-number"><small>ESTIMATED MONTHLY EMI</small><strong>{rupees(result.emi)}</strong><span>per month for {inputs.tenureMonths} months</span></div><div className="burden-area"><div className="burden-ring" style={{ "--ring-progress": `${Math.min(result.burden * 100, 100)}%` } as React.CSSProperties}><div><strong>{percent(result.burden)}</strong><span>of income</span></div></div><div className="burden-copy"><small>MONTHLY DEBT LOAD</small><strong>{result.status}</strong><p>Existing EMIs plus this loan payment, compared with the income entered.</p></div></div><div className="result-separator" /><div className="result-row"><span>Principal borrowed</span><strong>{rupees(inputs.loanAmount)}</strong></div><div className="result-row"><span>Estimated total interest</span><strong>{rupees(result.totalInterest)}</strong></div><div className="result-row"><span>Total repayment</span><strong>{rupees(result.totalRepayment)}</strong></div><div className="result-separator" /><div className="outcome-label"><Activity size={18} /><div><strong>Why this result?</strong><p>{result.reasons[0]}</p></div></div><button className="dark-action" onClick={() => navigate("insights")}>Explore next steps <ArrowRight size={17} /></button></> : <div className="soft-empty">{analysis.error}</div>}</section></div>
            <section className="panel scenario-panel" aria-labelledby="scenario-title"><div className="scenario-head"><div><div className="section-kicker">THE WHAT-IF LAB</div><h2 id="scenario-title">Change one number. See what shifts.</h2><p>Pin a baseline, then adjust the sliders to compare two borrowing paths.</p></div><button className="outline-button" onClick={() => setBaseline({ ...inputs })} disabled={!result}><Bookmark size={16} /> Pin current as baseline</button></div><div className="scenario-grid"><div className="scenario-controls">{([
              { label: "Loan amount", key: "loanAmount", value: rupees(inputs.loanAmount), min: 50000, max: 5000000, step: 10000, ends: ["₹50,000", "₹50 lakh"] },
              { label: "Repayment period", key: "tenureMonths", value: `${inputs.tenureMonths} months`, min: 12, max: 360, step: 6, ends: ["1 year", "30 years"] },
              { label: "Existing EMIs", key: "existingEmi", value: rupees(inputs.existingEmi), min: 0, max: 100000, step: 500, ends: ["₹0", "₹1 lakh"] },
            ] as const).map(item => <div className="slider-block" key={item.key}><div><label htmlFor={`slider-${item.key}`}>{item.label}</label><strong>{item.value}</strong></div><Slider id={`slider-${item.key}`} aria-label={item.label} value={[Math.min(Math.max(inputs[item.key], item.min), item.max)]} min={item.min} max={item.max} step={item.step} onValueChange={values => update(item.key, values[0])} /><div className="slider-ends"><span>{item.ends[0]}</span><span>{item.ends[1]}</span></div></div>)}</div><div className="compare-card"><div className="compare-title">BASELINE VS CURRENT <span>LIVE COMPARISON</span></div><div className="compare-columns"><div><small>PINNED BASELINE</small><strong>{rupees(pinned.emi)}</strong><span>EMI / month</span><b>{percent(pinned.burden)} debt load</b></div><div><small>CURRENT PLAN</small><strong>{result ? rupees(result.emi) : "—"}</strong><span>EMI / month</span><b>{result ? `${percent(result.burden)} debt load` : "Check inputs"}</b></div></div><div className="compare-difference"><span>Monthly payment change</span><strong>{result ? `${result.emi > pinned.emi ? "+" : result.emi < pinned.emi ? "−" : ""}${rupees(Math.abs(result.emi - pinned.emi))}` : "—"}</strong></div><p>Lower monthly payments can mean more total interest over a longer tenure.</p></div></div></section>
          </TabsContent>

          <TabsContent value="credit" className="tab-panel"><div className="feature-heading"><div className="section-kicker">TOOL 02 / CREDIT CONTEXT</div><h2>Understand the score you enter.</h2><p>We analyze a score from your own report. This tool does not fetch, verify, or generate a bureau score.</p></div><div className="feature-grid"><section className="panel feature-panel"><div className="credit-visual"><div className="credit-arc"><span>ENTERED SCORE</span><strong>{inputs.creditScore ?? "—"}</strong><small>out of 900</small></div><div className="credit-scale"><span>300</span><span>500</span><span>700</span><span>900</span></div></div><NumberField label="Your reported credit score" value={inputs.creditScore} onChange={v => update("creditScore", v)} min={300} max={900} note="You can leave this blank and still use the EMI calculator." /></section><section className="panel feature-panel"><span className="feature-icon"><CreditCard size={22} /></span><div className="section-kicker">EDUCATIONAL CONTEXT</div><h3>{scoreContext.title}</h3><p>{scoreContext.detail}</p><div className="rule-list"><div><Check size={17} /> Check your official report for accuracy.</div><div><Check size={17} /> Pay existing obligations on time.</div><div><Check size={17} /> Compare the lender's published criteria.</div></div><div className="context-note"><Info size={17} /> A score alone cannot determine approval, pricing, or a lender's decision.</div></section></div></TabsContent>

          <TabsContent value="emi" className="tab-panel"><div className="feature-heading"><div className="section-kicker">TOOL 03 / EMI CALCULATOR</div><h2>Make the repayment visible.</h2><p>Change borrowing details in the planner; this breakdown updates automatically.</p></div><div className="stat-grid">{([["Monthly EMI", result ? rupees(result.emi) : "—", Calculator], ["Total interest", result ? rupees(result.totalInterest) : "—", Activity], ["Total repayment", result ? rupees(result.totalRepayment) : "—", Wallet]] as const).map(([label, value, Icon]) => <div className="mini-stat" key={label}><div>{label}<Icon size={18} /></div><strong>{value}</strong><small>For {inputs.tenureMonths} monthly payments</small></div>)}</div><section className="panel schedule-panel"><div className="panel-heading"><div><div className="section-kicker">AMORTIZATION</div><h2>Year-by-year breakdown</h2></div><button className="text-button" onClick={() => navigate("planner")}>Edit inputs <ArrowRight size={16} /></button></div>{schedule.length ? <><div className="bar-legend"><span><i className="legend-principal" /> Principal</span><span><i className="legend-interest" /> Interest</span></div><div className="bar-chart">{schedule.map(row => <div key={row.year} className="bar-column" title={`Year ${row.year}: ${rupees(row.principal)} principal, ${rupees(row.interest)} interest`}><div className="stack-bar" style={{ height: `${Math.max(12, (row.principal + row.interest) / (result!.emi * 12) * 100)}%` }}><span style={{ height: `${row.interest / (row.principal + row.interest) * 100}%` }} /><b style={{ height: `${row.principal / (row.principal + row.interest) * 100}%` }} /></div><small>Y{row.year}</small></div>)}</div><div className="table-scroll"><Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Principal paid</TableHead><TableHead>Interest paid</TableHead><TableHead>Balance left</TableHead></TableRow></TableHeader><TableBody>{schedule.map(row => <TableRow key={row.year}><TableCell>Year {row.year}</TableCell><TableCell>{rupees(row.principal)}</TableCell><TableCell>{rupees(row.interest)}</TableCell><TableCell>{rupees(row.balance)}</TableCell></TableRow>)}</TableBody></Table></div></> : <p className="soft-empty">Enter valid figures in the planner to see a schedule.</p>}</section></TabsContent>

          <TabsContent value="insights" className="tab-panel"><div className="feature-heading"><div className="section-kicker">TOOL 04 / FINANCIAL TIPS</div><h2>Know your next move.</h2><p>Clear steps from your inputs, plus optional AI explanations when Claude is connected.</p></div><div className="feature-grid"><section className="panel feature-panel"><div className="section-kicker">RULE-BASED EXPLANATION</div><h2>What shaped your estimate</h2>{result ? <><div className="insight-status"><Activity size={18} /><strong>{result.status}</strong><span>{percent(result.burden)} debt load</span></div><div className="reason-list">{result.reasons.map((reason, i) => <div key={reason}><span>{String(i + 1).padStart(2, "0")}</span><p>{reason}</p></div>)}</div></> : <p className="soft-empty">{analysis.error}</p>}</section><section className="panel feature-panel"><div className="section-kicker">PRACTICAL NEXT STEPS</div><h2>Actions to consider</h2><div className="action-list">{(result?.actions ?? ["Enter valid figures in the planner."]).map((action, i) => <div key={action}><span>{i + 1}</span><p>{action}</p></div>)}</div><div className="ai-block"><div><span className="feature-icon small"><Sparkles size={17} /></span><strong>{staticExport ? "AI summary on Vercel" : "Ask Claude for a plain-language summary"}</strong></div><p>{staticExport ? "GitHub Pages hosts the calculator and tips without a server. AI guidance is available on Vercel when connected." : "Only the figures needed for the explanation are sent. No name or contact details are collected."}</p><button className="dark-action" onClick={askClaude} disabled={!result || aiLoading || staticExport}>{aiLoading ? "Generating…" : "Generate AI guidance"}<ArrowRight size={16} /></button><small>{staticExport ? "Static preview: server features unavailable here." : connection.claude ? "Claude connected" : "Claude connection pending; the guidance above is ready."}</small>{aiError && <p className="inline-error" role="alert">{aiError}</p>}{aiText && <div className="ai-response"><span>CLAUDE GUIDANCE</span><p>{aiText}</p></div>}</div></section></div></TabsContent>

          <TabsContent value="saved" className="tab-panel"><div className="feature-heading"><div className="section-kicker">WORKSPACE / SAVED PLANS</div><h2>Keep the plans worth comparing.</h2><p>Plans remain available across visits on this device. No name or bank account is collected.</p></div><div className="feature-grid"><section className="panel feature-panel"><div className="section-kicker">SAVE CURRENT SCENARIO</div><h2>Give this plan a name</h2><p>Save the figures you entered. Load or delete the plan later.</p><label className="save-label" htmlFor="plan-name">Plan name</label><Input id="plan-name" className="field-input" maxLength={48} placeholder="e.g. Smaller loan, 5 years" value={name} onChange={e => setName(e.target.value)} />{connection.sheets && <label className="sync-option"><Checkbox checked={sync} onCheckedChange={value => setSync(value === true)} /> Also sync this anonymous plan to Google Sheets</label>}<button className="dark-action save-action" onClick={save} disabled={!result || !token}><Bookmark size={16} /> Save this plan</button>{notice && <p className="inline-success" role="status">{notice}</p>}{recordError && <p className="inline-error" role="alert">{recordError}</p>}<div className="context-note"><LockKeyhole size={16} /> Saving stores the entered financial figures. Sheet sync is optional.</div></section><section className="panel feature-panel"><div className="panel-heading"><div><div className="section-kicker">HISTORY</div><h2>Recent plans</h2></div><span className="history-count">{saved.length} saved</span></div>{loadingHistory ? <p className="soft-empty">Loading plans…</p> : saved.length ? <div className="saved-list">{saved.map(item => <div className="saved-item" key={item.id}><div><small>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small><strong>{item.label}</strong><span>{rupees(analyzeLoan(item.inputs).emi)} / month · {item.inputs.tenureMonths} months</span></div><div className="saved-actions"><button onClick={() => { setInputs(item.inputs); navigate("planner"); }} aria-label={`Load ${item.label}`}><ArrowRight size={18} /></button><button onClick={() => void remove(item.id)} aria-label={`Delete ${item.label}`}><Trash2 size={17} /></button></div></div>)}</div> : <div className="saved-empty"><Bookmark size={24} /><strong>No saved plans yet</strong><p>Name and save your current scenario to begin.</p></div>}</section></div></TabsContent>
        </Tabs><footer className="site-footer"><span>LoanLens AI · Capstone demonstration</span><span><ShieldCheck size={15} /> Estimates only. Rates, fees and decisions depend on the lender.</span></footer>
      </main></div></div>;
}
