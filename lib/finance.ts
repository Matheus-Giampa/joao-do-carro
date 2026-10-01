/**
 * Cálculo de parcela pela Tabela Price (PMT).
 * monthlyRatePct: taxa ao mês em % (ex.: 1.79)
 */
export function calcInstallment(financed: number, months: number, monthlyRatePct: number) {
  if (financed <= 0 || months <= 0) return 0;
  const i = monthlyRatePct / 100;
  if (i === 0) return financed / months;
  return (financed * i) / (1 - Math.pow(1 + i, -months));
}

export function simulate(vehicleValue: number, downPayment: number, months: number, monthlyRatePct: number) {
  const financed = Math.max(0, vehicleValue - downPayment);
  const installment = calcInstallment(financed, months, monthlyRatePct);
  const totalPaid = installment * months + Math.min(downPayment, vehicleValue);
  return {
    financed,
    installment,
    totalPaid,
    interest: Math.max(0, totalPaid - vehicleValue),
  };
}

export const FINANCE_DISCLAIMER =
  "Os valores apresentados são apenas uma simulação e podem variar conforme análise de crédito e instituição financeira.";
