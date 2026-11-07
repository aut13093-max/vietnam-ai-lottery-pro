
"use client";

import { useEffect, useMemo, useState } from "react";

const TYPES = [
  { id: "XSMB", name: "越南北部彩票", max: 99, count: 6 },
  { id: "XSMN", name: "越南南部彩票", max: 99, count: 6 },
  { id: "XSMT", name: "越南中部彩票", max: 99, count: 6 },
  { id: "MEGA", name: "Mega 6/45", max: 45, count: 6 },
  { id: "POWER", name: "Power 6/55", max: 55, count: 6 }
];

const STORE = "vietnam-lottery-v1";

function formatNumber(n, type) {
  return type === "XSMB" || type === "XSMN" || type === "XSMT"
    ? String(n).padStart(2, "0")
    : String(n);
}

function getStats(draws, type) {
  const config = TYPES.find(t => t.id === type);
  const frequency = {};

  for (let i = 0; i <= config.max; i++) {
    frequency[i] = 0;
  }

  draws.forEach(draw => {
    draw.numbers.forEach(n => {
      frequency[n] = (frequency[n] || 0) + 1;
    });
  });

  const rows = Object.entries(frequency).map(([number, count]) => {
    const index = draws.findIndex(draw =>
      draw.numbers.includes(Number(number))
    );

    return {
      number: Number(number),
      count,
      missing: index === -1 ? draws.length : index
    };
  });

  return {
    rows,
    hot: [...rows].sort((a, b) => b.count - a.count),
    cold: [...rows].sort((a, b) => a.count - b.count),
    missing: [...rows].sort((a, b) => b.missing - a.missing)
  };
}

function generateNumbers(type) {
  const config = TYPES.find(t => t.id === type);
  const result = [];

  for (let i = 0; i < 5; i++) {
    const numbers = [];

    while (numbers.length < config.count) {
      const n = Math.floor(Math.random() * config.max) + 1;

      if (!numbers.includes(n)) {
        numbers.push(n);
      }
    }

    result.push(numbers.sort((a, b) => a - b));
  }

  return result;
}

export default function Home() {
  const [selected, setSelected] = useState("XSMB");
  const [tab, setTab] = useState("overview");
  const [draws, setDraws] = useState({});
  const [date, setDate] = useState("");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved) setDraws(JSON.parse(saved));
    } catch {
      setMessage("本地数据读取失败，请检查浏览器存储。");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(draws));
  }, [draws]);

  const currentDraws = draws[selected] || [];

  const stats = useMemo(
    () => getStats(currentDraws, selected),
    [currentDraws, selected]
  );

  function addDraw() {
    const config = TYPES.find(t => t.id === selected);

    if (!date) {
      setMessage("请选择开奖日期。");
      return;
    }

    const tokens = input.match(/\d+/g) || [];
    const numbers = tokens.map(Number);

    if (
      numbers.length !== config.count ||
      numbers.some(n => !Number.isInteger(n) || n < 1 || n > config.max) ||
      new Set(numbers).size !== numbers.length
    ) {
      setMessage(
        `请输入${config.count}个不同号码，范围为1至${config.max}。传统彩票暂按6个两位号码进行研究录入。`
      );
      return;
    }

    const existing = currentDraws.some(d => d.date === date);

    if (existing) {
      setMessage("这个日期已有记录，请先检查历史数据。");
      return;
    }

    const next = {
      ...draws,
      [selected]: [
        ...currentDraws,
        {
          date,
          numbers: numbers.sort((a, b) => a - b)
        }
      ].sort((a, b) => b.date.localeCompare(a.date))
    };

    setDraws(next);
    setInput("");
    setMessage("开奖记录已保存到本机。");
  }

  function removeDraw(dateToRemove) {
    if (!confirm("确定删除这期记录吗？")) return;

    setDraws({
      ...draws,
      [selected]: currentDraws.filter(d => d.date !== dateToRemove)
    });

    setMessage("记录已删除。");
  }

  function createSuggestions() {
    setSuggestions(generateNumbers(selected));
    setTab("suggestions");
  }

  const config = TYPES.find(t => t.id === selected);

  return (
    <main className="container">

      <header className="header">
        <div className="logo">AI LOTTERY STATISTICS</div>
        <h1>VIETNAM AI LOTTERY PRO</h1>
        <p className="subtitle">
          越南全类型彩票数据统计与研究平台
        </p>
        <p className="success">V1.0 · MOBILE EDITION</p>
      </header>

      <section className="card">
        <h2>选择彩票类别</h2>
        <div className="grid">
          {TYPES.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item.id);
                setMessage("");
                setSuggestions([]);
              }}
              className={`lottery-button ${
                selected === item.id ? "active" : ""
              }`}
            >
              <strong>{item.id}</strong>
              <p>{item.name}</p>
              <small className="muted">
                号码范围：1–{item.max}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{config.name} · 数据分析</h2>

        <div className="tabs">
          {[
            ["overview", "数据总览"],
            ["hot", "热门号码"],
            ["cold", "冷门号码"],
            ["missing", "遗漏分析"],
            ["history", "历史记录"],
            ["suggestions", "参考组合"],
            ["add", "录入开奖"]
          ].map(([id, name]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`tab ${tab === id ? "active" : ""}`}
            >
              {name}
            </button>
          ))}
        </div>

        {message && (
          <p className="success">{message}</p>
        )}

        {tab === "overview" && (
          <>
            <div className="grid">
              <div className="card">
                <p className="muted">历史记录期数</p>
                <h2>{currentDraws.length}</h2>
              </div>
              <div className="card">
                <p className="muted">号码总范围</p>
                <h2>{config.max}</h2>
              </div>
              <div className="card">
                <p className="muted">数据状态</p>
                <h2>{currentDraws.length ? "已录入" : "待录入"}</h2>
              </div>
            </div>

            <p className="muted">
              当前分析：{config.name}
            </p>

            <div className="warning">
              统计结果必须建立在真实历史开奖数据上。
              目前没有自动联网获取开奖数据，请先录入记录。
            </div>
          </>
        )}

        {["hot", "cold", "missing"].includes(tab) && (
          <>
            <h3>
              {tab === "hot" ? "🔥 热门号码" :
               tab === "cold" ? "❄️ 冷门号码" :
               "📉 当前遗漏期数"}
            </h3>

            {currentDraws.length === 0 ? (
              <p className="muted">暂无历史数据，请先录入开奖结果。</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>号码</th>
                    <th>出现次数</th>
                    <th>遗漏期数</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === "hot" ? stats.hot :
                    tab === "cold" ? stats.cold :
                    stats.missing).slice(0, 20).map(row => (
                    <tr key={row.number}>
                      <td>{formatNumber(row.number, selected)}</td>
                      <td>{row.count}</td>
                      <td>{row.missing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === "history" && (
          <>
            <h3>历史开奖记录</h3>

            {currentDraws.length === 0 ? (
              <p className="muted">尚未录入任何开奖结果。</p>
            ) : (
              currentDraws.map(draw => (
                <div className="card" key={draw.date}>
                  <strong>{draw.date}</strong>
                  <div className="numbers">
                    {draw.numbers.map(n => (
                      <span className="ball" key={n}>
                        {formatNumber(n, selected)}
                      </span>
                    ))}
                  </div>
                  <button
                    className="secondary"
                    style={{ marginTop: 12 }}
                    onClick={() => removeDraw(draw.date)}
                  >
                    删除记录
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {tab === "add" && (
          <>
            <h3>录入真实开奖数据</h3>

            <label>开奖日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            <label>
              开奖号码（用空格或逗号分隔）
            </label>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                selected === "MEGA"
                  ? "例如：03 12 18 25 36 44"
                  : selected === "POWER"
                  ? "例如：03 12 18 25 36 54"
                  : "例如：05 12 28 36 57 89"
              }
            />

            <button className="primary" onClick={addDraw}>
              保存开奖数据
            </button>

            <p className="muted">
              传统彩票这里采用6个两位号码作为简化研究样本，
              不代表完整官方奖项数据。
            </p>
          </>
        )}

        {tab === "suggestions" && (
          <>
            <h3>AI 参考组合研究</h3>

            <p className="muted">
              下面是随机生成的研究组合，不是中奖预测。
            </p>

            <button
              className="primary"
              onClick={createSuggestions}
            >
              生成5组参考号码
            </button>

            {suggestions.map((group, index) => (
              <div className="card" key={index}>
                <strong>参考组合 {index + 1}</strong>
                <div className="numbers">
                  {group.map(n => (
                    <span className="ball" key={n}>
                      {formatNumber(n, selected)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <section className="card">
        <h3>统计与风险说明</h3>
        <p className="muted">
          热号、冷号、遗漏期数只描述历史数据。
          随机生成的组合不具有经过验证的预测优势。
          每期彩票开奖结果独立且具有随机性。
        </p>
      </section>

      <footer>
        VIETNAM AI LOTTERY PRO © 2026
      </footer>

    </main>
  );
}
