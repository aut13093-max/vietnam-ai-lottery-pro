
"use client";

import { useEffect, useMemo, useState } from "react";

const LOTTERIES = [
  { id: "XSMB", name: "北部彩票", min: 0, max: 99 },
  { id: "XSMN", name: "南部彩票", min: 0, max: 99 },
  { id: "XSMT", name: "中部彩票", min: 0, max: 99 },
  { id: "MEGA", name: "Mega 6/45", min: 1, max: 45 },
  { id: "POWER", name: "Power 6/55", min: 1, max: 55 }
];

const STORAGE_KEY = "vietnam_ai_lottery_pro_v1";
const RESEARCH = ["热门号码", "冷门号码", "遗漏统计", "奇偶大小分析"];

export default function Home() {
  const [selected, setSelected] = useState("XSMB");
  const [research, setResearch] = useState("热门号码");
  const [draws, setDraws] = useState({});
  const [drawDate, setDrawDate] = useState("");
  const [numbersInput, setNumbersInput] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const lottery = LOTTERIES.find(x => x.id === selected);
  const currentDraws = draws[selected] || [];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDraws(JSON.parse(saved));
    } catch {
      setMessage("读取本机数据失败");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
      } catch {
        setMessage("本机保存失败，请检查浏览器存储设置");
      }
    }
  }, [draws, loaded]);

  const stats = useMemo(() => {
    const frequency = {};
    const lastSeen = {};

    const allNumbers = Array.from(
      { length: lottery.max - lottery.min + 1 },
      (_, i) => i + lottery.min
    );

    allNumbers.forEach(n => frequency[n] = 0);

    currentDraws.forEach((draw, index) => {
      draw.numbers.forEach(n => {
        frequency[n] = (frequency[n] || 0) + 1;
        if (lastSeen[n] === undefined) lastSeen[n] = index;
      });
    });

    const sorted = [...allNumbers].sort(
      (a, b) => frequency[b] - frequency[a] || a - b
    );

    const omission = allNumbers.map(n => ({
      number: n,
      count: lastSeen[n] === undefined
        ? currentDraws.length
        : lastSeen[n]
    }));

    return {
      frequency,
      hot: sorted.filter(n => frequency[n] > 0).slice(0, 10),
      cold: [...sorted].reverse().slice(0, 10),
      omission: omission.sort((a, b) => b.count - a.count).slice(0, 10)
    };
  }, [currentDraws, lottery]);

  function formatNumber(n) {
    return String(n).padStart(2, "0");
  }

  function selectLottery(id) {
    alert("JavaScript 按钮正常运行");
    setSelected(id);
    setMessage("");
  }

  function addDraw(event) {
    event.preventDefault();
    setMessage("");

    const numbers = numbersInput
      .split(/[\s,，;；]+/)
      .filter(Boolean)
      .map(Number);

    if (numbers.length !== 6) {
      setMessage("请输入准确的6个号码，用空格分隔。");
      return;
    }

    if (numbers.some(n =>
      !Number.isInteger(n) ||
      n < lottery.min ||
      n > lottery.max
    )) {
      setMessage(`号码范围错误：${lottery.min} 至 ${lottery.max}`);
      return;
    }

    if (new Set(numbers).size !== 6) {
      setMessage("6个号码不能重复。");
      return;
    }

    const newDraw = {
      id: Date.now(),
      date: drawDate || new Date().toISOString().slice(0, 10),
      numbers
    };

    setDraws(prev => ({
      ...prev,
      [selected]: [newDraw, ...(prev[selected] || [])]
    }));

    setNumbersInput("");
    setMessage("开奖数据已保存到本机。");
  }

  function deleteDraw(id) {
    if (!window.confirm("确定删除这条记录吗？")) return;

    setDraws(prev => ({
      ...prev,
      [selected]: prev[selected].filter(d => d.id !== id)
    }));
  }

  function clearCurrent() {
    if (!window.confirm("确定清空当前彩票全部记录吗？")) return;

    setDraws(prev => ({
      ...prev,
      [selected]: []
    }));

    setMessage("当前彩票记录已清空。");
  }

  const panel = {
    background: "#fff",
    border: "1px solid #e1e7ef",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  };

  const button = {
    padding: "12px 10px",
    borderRadius: 8,
    border: "1px solid #d5dce6",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    touchAction: "manipulation"
  };

  return (
    <main style={{
      minHeight: "100vh",
      padding: 16,
      background: "#f3f6fb",
      color: "#172033",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 1000, margin: "auto" }}>

        <header style={{
          background: "#10233f",
          color: "#fff",
          padding: 22,
          borderRadius: 14,
          marginBottom: 16
        }}>
          <div style={{ color: "#69d6ff" }}>
            AI STATISTICS PLATFORM
          </div>
          <h1>VIETNAM AI LOTTERY PRO</h1>
          <p>越南全类型彩票数据统计与研究平台</p>
          <small>VERSION 1.2 · INTERACTION TEST</small>
        </header>

        <section style={panel}>
          <h3>选择彩票类型</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
            gap: 8
          }}>
            {LOTTERIES.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLottery(item.id)}
                style={{
                  ...button,
                  background: selected === item.id ? "#174ea6" : "#fff",
                  color: selected === item.id ? "#fff" : "#172033"
                }}
              >
                {item.id}
                <div style={{ fontSize: 12, marginTop: 5 }}>
                  {item.name}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section style={panel}>
          <h3>当前研究项目</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
            gap: 8
          }}>
            {RESEARCH.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setResearch(item)}
                style={{
                  ...button,
                  background: research === item ? "#087f5b" : "#fff",
                  color: research === item ? "#fff" : "#172033"
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section style={panel}>
          <h3>当前彩票：{selected}</h3>
          <p>研究项目：{research}</p>
          <p>已录入开奖期数：{currentDraws.length}</p>
          <p>号码范围：{formatNumber(lottery.min)} - {formatNumber(lottery.max)}</p>
        </section>

        <section style={panel}>
          <h3>录入历史开奖数据</h3>
          <form onSubmit={addDraw}>
            <label>开奖日期</label>
            <input
              type="date"
              value={drawDate}
              onChange={e => setDrawDate(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                margin: "8px 0 14px",
                boxSizing: "border-box"
              }}
            />

            <label>输入6个号码</label>
            <input
              type="text"
              value={numbersInput}
              onChange={e => setNumbersInput(e.target.value)}
              placeholder="03 12 18 25 36 44"
              style={{
                width: "100%",
                padding: 12,
                margin: "8px 0 14px",
                boxSizing: "border-box"
              }}
            />

            <button type="submit" style={{
              ...button,
              width: "100%",
              background: "#174ea6",
              color: "#fff"
            }}>
              保存开奖数据
            </button>
          </form>

          {message && (
            <p style={{ color: "#087f5b", fontWeight: "bold" }}>
              {message}
            </p>
          )}

          <small>
            当前版本每期开奖录入6个号码，仅用于基础统计测试。
            越南传统彩票完整奖项结构尚未接入。
          </small>
        </section>

        <section style={panel}>
          <h3>{research}</h3>

          {currentDraws.length === 0 ? (
            <p>等待导入历史开奖数据，请先录入开奖记录。</p>
          ) : (
            <>
              {research === "热门号码" && stats.hot.map(n => (
                <span key={n} style={{
                  display: "inline-block",
                  padding: 12,
                  margin: 5,
                  borderRadius: "50%",
                  background: "#e3f2fd",
                  color: "#174ea6"
                }}>
                  {formatNumber(n)} ({stats.frequency[n]})
                </span>
              ))}

              {research === "冷门号码" && stats.cold.map(n => (
                <span key={n} style={{
                  display: "inline-block",
                  padding: 12,
                  margin: 5,
                  borderRadius: "50%",
                  background: "#fff0e6",
                  color: "#b45309"
                }}>
                  {formatNumber(n)} ({stats.frequency[n]})
                </span>
              ))}

              {research === "遗漏统计" && (
                <table style={{
                  width: "100%",
                  textAlign: "center",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr>
                      <th>号码</th>
                      <th>遗漏期数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.omission.map(item => (
                      <tr key={item.number}>
                        <td>{formatNumber(item.number)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {research === "奇偶大小分析" && (() => {
                const nums = currentDraws.flatMap(d => d.numbers);
                const odd = nums.filter(n => n % 2 !== 0).length;
                const even = nums.length - odd;
                const middle = (lottery.min + lottery.max) / 2;
                const big = nums.filter(n => n > middle).length;
                const small = nums.length - big;

                return (
                  <div>
                    <p>历史号码总数：{nums.length}</p>
                    <p>奇数出现次数：{odd}</p>
                    <p>偶数出现次数：{even}</p>
                    <p>大数出现次数：{big}</p>
                    <p>小数出现次数：{small}</p>
                  </div>
                );
              })()}
            </>
          )}
        </section>

        <section style={panel}>
          <h3>历史开奖记录</h3>

          {currentDraws.length === 0 ? (
            <p>暂无历史记录。</p>
          ) : (
            currentDraws.map(draw => (
              <div key={draw.id} style={{
                padding: "12px 0",
                borderBottom: "1px solid #eee"
              }}>
                <strong>{draw.date}</strong>
                <div style={{ margin: "8px 0" }}>
                  {draw.numbers.map((n, i) => (
                    <span key={i} style={{
                      display: "inline-block",
                      padding: 9,
                      margin: 3,
                      borderRadius: "50%",
                      background: "#edf3ff",
                      color: "#174ea6"
                    }}>
                      {formatNumber(n)}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => deleteDraw(draw.id)}
                  style={button}
                >
                  删除记录
                </button>
              </div>
            ))
          )}

          {currentDraws.length > 0 && (
            <button
              type="button"
              onClick={clearCurrent}
              style={{
                ...button,
                color: "#b42318",
                marginTop: 12
              }}
            >
              清空当前彩票数据
            </button>
          )}
        </section>

        <section style={{
          ...panel,
          background: "#fff8e7"
        }}>
          <strong>AI研究说明</strong>
          <p>
            本版本根据手动录入的数据进行频率、遗漏和奇偶大小统计。
            数据保存在当前设备浏览器，不会自动同步。
            历史频率不代表下一期中奖概率提高，也不能保证中奖。
          </p>
        </section>

        <footer style={{
          textAlign: "center",
          padding: 12,
          color: "#68758a"
        }}>
          VIETNAM AI LOTTERY PRO V1.2
        </footer>

      </div>
    </main>
  );
}
