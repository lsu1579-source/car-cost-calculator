// ===== 계산 =====

// 입력값 객체를 받아 항목별 월/연 비용과 총비용을 돌려줍니다.
// 화면(HTML)은 건드리지 않고 계산만 합니다.
function calculateCosts(inputs) {
  // 월 단위로 입력받는 항목: 월 비용을 먼저 구하고 연 비용은 × 12
  const fuelMonthly = (inputs.monthlyKm / inputs.fuelEfficiency) * inputs.fuelPrice;
  const parkingMonthly = inputs.parkingMonthly;
  const depreciationMonthly = (inputs.purchasePrice - inputs.currentValue) / inputs.monthsOwned;

  // 연 단위로 입력받는 항목: 연 비용이 입력값이고 월 비용은 ÷ 12
  const insuranceYearly = inputs.insuranceYearly;
  const carTaxYearly = inputs.carTaxYearly;
  const maintenanceYearly = inputs.maintenanceYearly;

  const items = [
    { name: '주유비', monthly: fuelMonthly, yearly: fuelMonthly * 12 },
    { name: '보험료', monthly: insuranceYearly / 12, yearly: insuranceYearly },
    { name: '자동차세', monthly: carTaxYearly / 12, yearly: carTaxYearly },
    { name: '주차비', monthly: parkingMonthly, yearly: parkingMonthly * 12 },
    { name: '정비비', monthly: maintenanceYearly / 12, yearly: maintenanceYearly },
    { name: '감가상각', monthly: depreciationMonthly, yearly: depreciationMonthly * 12 },
  ];

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  for (const item of items) {
    monthlyTotal += item.monthly;
    yearlyTotal += item.yearly;
  }

  return { items, monthlyTotal, yearlyTotal };
}

// ===== 임시 확인용 (2단계) =====
// index.html의 기본값과 같은 예시 입력으로 계산 결과를 콘솔에 출력합니다.
// 3단계에서 실제 입력값을 읽도록 바꾸면 삭제합니다.
const exampleInputs = {
  fuelPrice: 1700,
  fuelEfficiency: 12,
  monthlyKm: 1000,
  insuranceYearly: 900000,
  carTaxYearly: 300000,
  parkingMonthly: 100000,
  maintenanceYearly: 600000,
  purchasePrice: 40000000,
  currentValue: 36000000,
  monthsOwned: 6,
};

console.log(calculateCosts(exampleInputs));
