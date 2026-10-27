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

// 월 총비용에서 한 항목이 차지하는 비중(%)을 구합니다.
// 총비용이 0원이면 0으로 나누지 않도록 0%로 처리합니다.
function calculateShare(itemMonthly, monthlyTotal) {
  if (monthlyTotal === 0) {
    return 0;
  }
  return (itemMonthly / monthlyTotal) * 100;
}

// 항목별 내역 표의 HTML을 만듭니다. items 배열의 항목 하나가 표의 한 행이 됩니다.
function buildBreakdownTable(result) {
  let rows = '';
  for (const item of result.items) {
    const share = calculateShare(item.monthly, result.monthlyTotal);
    // 막대: 회색 바탕 안에 비중만큼 너비를 채운 막대 (디자인은 7단계에서 정리)
    rows += `
      <tr>
        <td>${item.name}</td>
        <td>${formatWon(item.monthly)}</td>
        <td>${formatWon(item.yearly)}</td>
        <td>
          ${share.toFixed(1)}%
          <div style="display: inline-block; width: 100px; height: 10px; background: #ddd;">
            <div style="width: ${share}%; height: 100%; background: #4a7;"></div>
          </div>
        </td>
      </tr>
    `;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>항목</th>
          <th>월 비용</th>
          <th>연 비용</th>
          <th>비중(%)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// 월 총비용, 연 총비용, 항목별 내역 표를 결과 영역에 표시합니다.
function showResults(result) {
  document.getElementById('results-content').innerHTML = `
    <p>월 총비용: ${formatWon(result.monthlyTotal)}</p>
    <p>연 총비용: ${formatWon(result.yearlyTotal)}</p>
    ${buildBreakdownTable(result)}
  `;
}

// ===== 버튼 연결 =====

// 계산하기 버튼을 누르면: 입력 읽기 → 계산 → 결과 표시
document.getElementById('calculate-button').addEventListener('click', function () {
  const inputs = readInputs();
  const result = calculateCosts(inputs);
  showResults(result);
});
