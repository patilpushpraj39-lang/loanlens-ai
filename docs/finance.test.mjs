import assert from 'node:assert/strict';
import { monthlyPayment, amortization, analyzeLoan, sampleInputs, validateInputs } from '../lib/finance.ts';
assert.ok(Math.abs(monthlyPayment(500000,12,36)-16607.1549)<.01);
assert.equal(monthlyPayment(120000,0,12),10000);
for (const rate of [0, 8, 12, 40]) {
 const rows=amortization({...sampleInputs,annualRate:rate});
 assert.ok(rows.at(-1).balance<.01);
 assert.ok(Math.abs(rows.reduce((sum,row)=>sum+row.principal,0)-sampleInputs.loanAmount)<.01);
}
assert.throws(()=>validateInputs({...sampleInputs,monthlyIncome:0}));
assert.throws(()=>validateInputs({...sampleInputs,tenureMonths:1.5}));
assert.throws(()=>validateInputs({...sampleInputs,creditScore:901}));
assert.equal(analyzeLoan({...sampleInputs,employment:'student'}).status,'Review carefully');
assert.equal(analyzeLoan({...sampleInputs,monthlyIncome:10000}).status,'Adjust the plan');
assert.equal(analyzeLoan({...sampleInputs,creditScore:null}).status,'Review carefully');
console.log('Finance checks passed: EMI, zero interest, amortization, validation, employment and debt review.');
