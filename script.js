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

// ===== 입력 읽기 =====

// HTML 입력칸의 id 목록입니다. calculateCosts가 쓰는 입력값 이름과 같습니다.
const INPUT_IDS = [
  'fuelPrice',
  'fuelEfficiency',
  'monthlyKm',
  'insuranceYearly',
  'carTaxYearly',
  'parkingMonthly',
  'maintenanceYearly',
  'purchasePrice',
  'currentValue',
  'monthsOwned',
];

// 각 입력칸의 값(문자열)을 숫자로 바꿔 하나의 객체에 담습니다.
// 예: { fuelPrice: 1700, fuelEfficiency: 12, ... }
function readInputs() {
  const inputs = {};
  for (const id of INPUT_IDS) {
    inputs[id] = Number(document.getElementById(id).value);
  }
  return inputs;
}

// ===== 화면 출력 =====

// 금액을 원 단위로 반올림하고 천 단위 쉼표를 붙입니다. 예: 1058333.33 → "1,058,333원"
function formatWon(amount) {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 계산 결과 중 월 총비용과 연 총비용을 결과 영역에 표시합니다.
function showResults(result) {
  document.getElementById('results-content').innerHTML = `
    <p>월 총비용: ${formatWon(result.monthlyTotal)}</p>
    <p>연 총비용: ${formatWon(result.yearlyTotal)}</p>
  `;
}

// ===== 버튼 연결 =====

// 계산하기 버튼을 누르면: 입력 읽기 → 계산 → 결과 표시
document.getElementById('calculate-button').addEventListener('click', function () {
  const inputs = readInputs();
  const result = calculateCosts(inputs);
  showResults(result);
});
