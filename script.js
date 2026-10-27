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

// 시나리오 B 입력칸의 id 목록입니다. 유가와 월 주행거리만 바꿀 수 있습니다.
const SCENARIO_B_IDS = ['compareFuelPrice', 'compareMonthlyKm'];

// ids 목록에 있는 입력칸의 값(문자열)을 숫자로 바꿔 하나의 객체에 담습니다.
// 예: readInputs(INPUT_IDS) → { fuelPrice: 1700, fuelEfficiency: 12, ... }
// 빈칸은 Number('')가 0이 되어 버리므로, 0 대신 NaN(숫자 아님)으로 바꿔 검증에서 걸러지게 합니다.
function readInputs(ids) {
  const inputs = {};
  for (const id of ids) {
    const text = document.getElementById(id).value.trim();
    inputs[id] = text === '' ? NaN : Number(text);
  }
  return inputs;
}

// ===== 입력 검증 =====

// 입력값을 검사해 잘못된 칸의 오류 메시지를 모아 돌려줍니다.
// 예: { fuelEfficiency: '연비는 0보다 커야 합니다' }
// 문제가 없으면 빈 객체 {}를 돌려줍니다.
function validate(inputs) {
  const errors = {};

  for (const id of INPUT_IDS) {
    const value = inputs[id];

    if (!Number.isFinite(value)) {
      errors[id] = '숫자를 입력해주세요';
    } else if (id === 'fuelEfficiency' && value <= 0) {
      errors[id] = '연비는 0보다 커야 합니다';
    } else if (id === 'monthsOwned' && (value < 1 || !Number.isInteger(value))) {
      errors[id] = '보유 기간은 1개월 이상의 정수로 입력해주세요';
    } else if (value < 0) {
      errors[id] = '0 이상이어야 합니다';
    }
  }

  // 두 칸이 모두 올바른 숫자일 때만 서로 비교합니다.
  if (!errors.purchasePrice && !errors.currentValue && inputs.currentValue > inputs.purchasePrice) {
    errors.currentValue = '현재 차량가치는 구입 가격보다 클 수 없습니다';
  }

  return errors;
}

// 시나리오 B 입력값(비교 유가, 비교 월 주행거리)을 검사합니다. 둘 다 0 이상이어야 합니다.
function validateScenarioB(scenarioB) {
  const errors = {};

  for (const id of SCENARIO_B_IDS) {
    const value = scenarioB[id];

    if (!Number.isFinite(value)) {
      errors[id] = '숫자를 입력해주세요';
    } else if (value < 0) {
      errors[id] = '0 이상이어야 합니다';
    }
  }

  return errors;
}

// ids 목록의 입력칸 중 오류가 있는 칸은 메시지와 빨간 테두리를 표시하고,
// 오류가 없는 칸은 이전 표시를 지웁니다.
function showErrors(ids, errors) {
  for (const id of ids) {
    const input = document.getElementById(id);
    const message = document.getElementById(id + '-error');

    if (errors[id]) {
      message.textContent = errors[id];
      input.style.outline = '2px solid red';
    } else {
      message.textContent = '';
      input.style.outline = '';
    }
  }
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

// ===== 시나리오 비교 =====

// 차이 금액 앞에 부호를 붙입니다. 예: 35000 → "+35,000원", -35000 → "-35,000원", 0 → "0원"
// 음수는 toLocaleString이 "-"를 붙여 주므로 양수일 때만 "+"를 붙입니다.
function formatDifference(amount) {
  const rounded = Math.round(amount);
  if (rounded > 0) {
    return '+' + formatWon(rounded);
  }
  if (rounded === 0) {
    return '0원'; // 반올림 결과가 -0일 때 "-0원"으로 보이지 않도록 합니다.
  }
  return formatWon(rounded);
}

// 시나리오 A와 B의 월 비용을 항목별로 비교하는 표와, 연 총비용 비교를 표시합니다.
// 두 결과의 items는 같은 순서(주유비, 보험료, ...)로 들어 있습니다.
function showComparison(resultA, resultB) {
  let rows = '';
  for (let i = 0; i < resultA.items.length; i++) {
    const itemA = resultA.items[i];
    const itemB = resultB.items[i];
    rows += `
      <tr>
        <td>${itemA.name}</td>
        <td>${formatWon(itemA.monthly)}</td>
        <td>${formatWon(itemB.monthly)}</td>
        <td>${formatDifference(itemB.monthly - itemA.monthly)}</td>
      </tr>
    `;
  }

  document.getElementById('comparison-content').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>항목</th>
          <th>시나리오 A</th>
          <th>시나리오 B</th>
          <th>차이 (B − A)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
          <th>월 총비용</th>
          <th>${formatWon(resultA.monthlyTotal)}</th>
          <th>${formatWon(resultB.monthlyTotal)}</th>
          <th>${formatDifference(resultB.monthlyTotal - resultA.monthlyTotal)}</th>
        </tr>
      </tbody>
    </table>
    <p>
      연 총비용: A ${formatWon(resultA.yearlyTotal)} /
      B ${formatWon(resultB.yearlyTotal)} /
      차이 ${formatDifference(resultB.yearlyTotal - resultA.yearlyTotal)}
    </p>
  `;
}

// ===== 버튼 연결 =====

// 계산하기 버튼을 누르면: 입력 읽기 → 검증 → (문제없을 때만) 계산 → 결과 표시
document.getElementById('calculate-button').addEventListener('click', function () {
  const inputs = readInputs(INPUT_IDS);
  const scenarioB = readInputs(SCENARIO_B_IDS);

  const errors = validate(inputs);
  const errorsB = validateScenarioB(scenarioB);
  showErrors(INPUT_IDS, errors);
  showErrors(SCENARIO_B_IDS, errorsB);

  // 이전 결과를 먼저 지우고, 오류가 없는 결과만 다시 표시합니다.
  document.getElementById('results-content').innerHTML = '';
  document.getElementById('comparison-content').innerHTML = '';

  // 시나리오 A에 오류가 있으면 A 결과와 비교 결과 모두 계산하지 않습니다.
  if (Object.keys(errors).length > 0) {
    return;
  }

  const result = calculateCosts(inputs);
  showResults(result);

  // 시나리오 B에 오류가 있으면 비교 결과만 계산하지 않습니다.
  if (Object.keys(errorsB).length > 0) {
    return;
  }

  // A 입력값을 복사한 뒤 유가와 월 주행거리만 B 값으로 덮어씁니다.
  const inputsB = {
    ...inputs,
    fuelPrice: scenarioB.compareFuelPrice,
    monthlyKm: scenarioB.compareMonthlyKm,
  };
  const resultB = calculateCosts(inputsB);
  showComparison(result, resultB);
});
