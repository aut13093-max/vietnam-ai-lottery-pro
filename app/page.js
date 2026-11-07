
"use client";

import { useEffect, useMemo, useState } from "react";

const LOTTERIES = [
  { id: "XSMB", name: "XSMB 北部彩票", min: 0, max: 99 },
  { id: "XSMN", name: "XSMN 南部彩票", min: 0, max: 99 },
  { id: "XSMT", name: "XSMT 中部彩票", min: 0, max: 99 },
  { id: "MEGA", name: "Vietlott Mega 6/45", min: 1, max: 45 },
  { id: "POWER", name: "Vietlott Power 6/55", min: 1, max: 55 }
];

const STORAGE_KEY = "vietnam_ai_lottery_pro_v1";

export default function Home() {
  const [selected, setSelected] = useState("XSMB");
  const [research, setResearch] = useState("热门号码");
  const [draws, setDraws] = useState({});
  const [drawDate, setDrawDate] = useState("");
  const [numbersInput, setNumbersInput] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const lottery = LOTTERIES.find((item) => item.id === selected);

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
    }
  }, [draws, loaded]);

  const currentDraws = draws[selected] || [];

  const stats = useMemo(() => {
    const frequency = {};
    const lastSeen = {};

    for (let i = 0; i <= 99; i++) {
      frequency[i] = 0;
    }

    currentDraws.forEach((draw, index) => {
      draw.numbers.forEach((number) => {
        frequency[number]++;
        if (lastSeen[number] === undefined) {
          lastSeen[number] = index;
        }
      });
    });

    const allNumbers = Array.from(
      { length: lottery.max - lottery.min + 1 },
      (_, i) => i + lottery.min
    );

    const sorted = [...allNumbers].sort(
      (a, b) => frequency[b] - frequency[a] || a - b
    );

    const omission = allNumbers.map((number) => ({
      number,
      count:
        lastSeen[number] === undefined
          ? currentDraws.length
          : lastSeen[number]
    }));

    const odd = allNumbers.filter((n) => n % 2 !== 0);
    const even = allNumbers.filter((n) => n % 2 === 0);
    const middle = (lottery.min + lottery.max) / 2;

    const big = allNumbers.filter((n) => n > middle);
    const small = allNumbers.filter((n) => n <= middle);

    return {
      allNumbers,
      frequency,
      hot: sorted.filter((n) => frequency[n] > 0).slice(0, 10),
      cold: [...sorted].reverse().slice(0, 10),
      omission: omission.sort((a, b) => b.count - a.count).slice(0, 10),
      odd: odd.length,
      even: even.length,
      big: big.length,
      small: small.length
    };
  }, [currentDraws, lottery]);

  function addDraw(event) {
    event.preventDefault();
    setMessage("");

    const numbers = numbersInput
      .split(/[\s,，;；]+/)
      .filter(Boolean)
      .map(Number);

    if (numbers.length !== 6) {
      setMessage("请准确输入6个号码，用空格或逗号分隔。");
      return;
    }

    if (
      numbers.some(
        (n) =>
          !Number.isInteger(n) ||
          n < lottery.min ||
          n > lottery.max
      )
    ) {
      setMessage(
        `号码范围错误。${selected} 的范围是 ${lottery.min} 至 ${lottery.max}。`
      );
      return;
    }

    const newDraw = {
      id: Date.now(),
      date: drawDate || new Date().toISOString().slice(0, 10),
      numbers
    };

    setDraws((previous) => ({
      ...previous,
      [selected]: [newDraw, ...(previous[selected] || [])]
    }));

    setNumbersInput("");
    setMessage("开奖数据已保存到本机。");
  }

  function deleteDraw(id) {
    if (!window.confirm("确定删除这条开奖记录吗？")) return;

    setDraws((previous) => ({
      ...previous,
      [selected]: (previous[selected] || []).filter(
        (draw) => draw.id !== id
      )
    }));
  }

  function clearCurrent() {
    if (!window.confirm("确定删除当前彩票的全部历史数据吗？")) return;

    setDraws((previous) => ({
      ...previous,
      [selected]: []
    }));
    setMessage("当前彩票历史数据已清空。");
  }

  function formatNumber(number) {
    return String(number).padStart(2, "0");
  }

  const panelStyle = {
    background: "#ffffff",
    border: "1px solid #e1e7ef",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px"
  };

  const buttonStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d5dce6",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold"
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f3f6fb",
      color: "#172033",
      padding: "18px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: "1000px", margin: "auto" }}>

        <header style={{
          background: "#10233f",
          color: "white",
          borderRadius: "14px",
          padding: "24px 18px",
          marginBottom: "18px"
        }}>
          <div style={{ color: "#69d6ff", fontSize: "12px" }}>
            AI STATISTICS PLATFORM
          </div>
          <h1 style={{ margin: "8px 0", fontSize: "25px" }}>
            VIETNAM AI LOTTERY PRO
          </h1>
          <p style={{ margin: 0, color: "#d5e1f2" }}>
            越南全类型彩票数据统计与研究平台
          </p>
          <div style={{ marginTop: "12px", fontSize: "12px" }}>
            VERSION 1.1 · LOCAL DATA ANALYSIS
          </div>
        </header>

        <section style={panelStyle}>
          <h3>选择彩票类型</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))",
            gap: "8px"
          }}>
            {LOTTERIES.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item.id);
                  setMessage("");
                }}
                style={{
                  ...buttonStyle,
                  background: selected === item.id ? "#174ea6" : "#fff",
                  color: selected === item.id ? "#fff" : "#172033",
                  borderColor: selected === item.id ? "#174ea6" : "#d5dce6"
                }}
              >
                {item.id}
                <div style={{ fontSize: "11px", marginTop: "5px" }}>
                  {item.name}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <h3>当前研究项目</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: "8px"
          }}>
            {["热门号码", "冷门号码", "遗漏统计", "奇偶大小分析"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setResearch(item)}
                  style={{
                    ...buttonStyle,
                    background: research === item ? "#087f5b" : "#fff",
                    color: research === item ? "#fff" : "#172033"
                  }}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </section>

        <section style={panelStyle}>
          <h3>当前彩票：{selected}</h3>
          <p>研究项目：{research}</p>
          <p>已录入开奖期数：{currentDraws.length}</p>
          <p>号码范围：{formatNumber(lottery.min)} - {formatNumber(lottery.max)}</p>
        </section>

        <section style={panelStyle}>
          <h3>录入真实历史开奖数据</h3>
          <form onSubmit={addDraw}>
            <label style={{ display: "block", marginBottom: "6px" }}>
              开奖日期
            </label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccd4df",
                borderRadius: "8px",
                marginBottom: "12px"
              }}
            />

            <label style={{ display: "block", marginBottom: "6px" }}>
              输入6个号码
            </label>
            <input
              type="text"
              value={numbersInput}
              onChange={(e) => setNumbersInput(e.target.value)}
              placeholder="例如：03 12 18 25 36 44"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccd4df",
                borderRadius: "8px",
                marginBottom: "12px"
              }}
            />

            <button
              type="submit"
              style={{
                ...buttonStyle,
                background: "#174ea6",
                color: "white",
                width: "100%"
              }}
            >
              保存开奖数据
            </button>
          </form>

          {message && (
            <p style={{ color: "#087f5b", fontWeight: "bold" }}>
              {message}
            </p>
          )}

          <p style={{ fontSize: "12px", color: "#68758a" }}>
            当前版本每期开奖录入6个号码，用于基础统计测试。
            XSMB、XSMN、XSMT 的完整奖项结构尚未接入。
          </p>
        </section>

        <section style={panelStyle}>
          <h3>{research}</h3>

          {currentDraws.length === 0 ? (
            <p style={{ color: "#68758a" }}>
              等待导入真实历史开奖数据。请先录入开奖记录。
            </p>
          ) : (
            <>
              {research === "热门号码" && (
                <div>
                  <p>出现次数最多的前10个号码：</p>
                  {stats.hot.map((n) => (
                    <span key={n} style={{
                      display: "inline-block",
                      background: "#e3f2fd",
                      color: "#174ea6",
                      borderRadius: "50%",
                      padding: "12px",
                      margin: "5px",
                      fontWeight: "bold"
                    }}>
                      {formatNumber(n)} ({stats.frequency[n]})
                    </span>
                  ))}
                </div>
              )}

              {research === "冷门号码" && (
                <div>
                  <p>出现次数较少的前10个号码：</p>
                  {stats.cold.map((n) => (
                    <span key={n} style={{
                      display: "inline-block",
                      background: "#fff0e6",
                      color: "#b45309",
                      borderRadius: "50%",
                      padding: "12px",
                      margin: "5px",
                      fontWeight: "bold"
                    }}>
                      {formatNumber(n)} ({stats.frequency[n]})
                    </span>
                  ))}
                </div>
              )}

              {research === "遗漏统计" && (
                <div style={{ overflowX: "auto" }}>
                  <p>距离最近一次出现的开奖期数：</p>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "center"
                  }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "9px", background: "#edf1f7" }}>
                          号码
                        </th>
                        <th style={{ padding: "9px", background: "#edf1f7" }}>
                          遗漏期数
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.omission.map((item) => (
                        <tr key={item.number}>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                            {formatNumber(item.number)}
                          </td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {research === "奇偶大小分析" && (
                <div>
                  <p>号码范围内的分类数量：</p>
                  <p>奇数：{stats.odd}</p>
                  <p>偶数：{stats.even}</p>
                  <p>大数：{stats.big}</p>
                  <p>小数：{stats.small}</p>
                  <hr />
                  <p>当前历史数据总号码数：{
                    currentDraws.reduce(
                      (sum, draw) => sum + draw.numbers.length, 0
                    )
                  }</p>
                  <p>历史奇数出现次数：{
                    currentDraws.reduce(
                      (sum, draw) =>
                        sum + draw.numbers.filter((n) => n % 2 !== 0).length,
                      0
                    )
                  }</p>
                  <p>历史偶数出现次数：{
                    currentDraws.reduce(
                      (sum, draw) =>
                        sum + draw.numbers.filter((n) => n % 2 === 0).length,
                      0
                    )
                  }</p>
                </div>
              )}
            </>
          )}
        </section>

        <section style={panelStyle}>
          <h3>历史开奖记录</h3>

          {currentDraws.length === 0 ? (
            <p>暂无历史记录。</p>
          ) : (
            currentDraws.map((draw) => (
              <div key={draw.id} style={{
                borderBottom: "1px solid #e5e9f0",
                padding: "12px 0"
              }}>
                <strong>{draw.date}</strong>
                <div style={{ margin: "8px 0" }}>
                  {draw.numbers.map((n, index) => (
                    <span key={index} style={{
                      display: "inline-block",
                      background: "#edf3ff",
                      color: "#174ea6",
                      borderRadius: "50%",
                      padding: "9px",
                      margin: "3px",
                      fontWeight: "bold"
                    }}>
                      {formatNumber(n)}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => deleteDraw(draw.id)}
                  style={{
                    ...buttonStyle,
                    color: "#b42318",
                    fontSize: "12px"
                  }}
                >
                  删除记录
                </button>
              </div>
            ))
          )}

          {currentDraws.length > 0 && (
            <button
              onClick={clearCurrent}
              style={{
                ...buttonStyle,
                color: "#b42318",
                marginTop: "14px"
              }}
            >
              清空当前彩票数据
            </button>
          )}
        </section>

        <section style={{
          background: "#fff8e7",
          border: "1px solid #f0dca8",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px"
        }}>
          <strong>AI研究说明</strong>
          <p style={{ fontSize: "13px", lineHeight: "1.7" }}>
            本版本根据用户录入的历史数据进行频率、遗漏和组合基础统计。
            数据保存在当前设备浏览器中，不会自动同步到其他设备。
            历史频率不代表下一期中奖概率提高，也不能保证中奖。
          </p>
        </section>

        <footer style={{
          textAlign: "center",
          color: "#68758a",
          fontSize: "12px",
          padding: "12px"
        }}>
          VIETNAM AI LOTTERY PRO V1.1
        </footer>
      </div>
    </main>
  );
}
