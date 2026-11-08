
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
  const [messageType, setMessageType] = useState("success");
  const [loaded, setLoaded] = useState(false);

  const lottery = LOTTERIES.find(x => x.id === selected);
  const currentDraws = draws[selected] || [];

  // 读取本机历史数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {
          setDraws(parsed);
        }
      }
    } catch {
      setMessage("读取本机数据失败");
      setMessageType("error");
    }

    setLoaded(true);
  }, []);

  // 自动保存到本机
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
    } catch {
      setMessage("本机保存失败，请检查浏览器存储设置");
      setMessageType("error");
    }
  }, [draws, loaded]);

  // 统计计算
  const stats = useMemo(() => {
    const frequency = {};
    const lastSeen = {};

    const allNumbers = Array.from(
      { length: lottery.max - lottery.min + 1 },
      (_, i) => i + lottery.min
    );

    allNumbers.forEach(n => {
      frequency[n] = 0;
    });

    currentDraws.forEach((draw, index) => {
      draw.numbers.forEach(n => {
        frequency[n] = (frequency[n] || 0) + 1;

        if (lastSeen[n] === undefined) {
          lastSeen[n] = index;
        }
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
      cold: [...allNumbers].sort(
        (a, b) => frequency[a] - frequency[b] || a - b
      ).slice(0, 10),
      omission: omission
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }, [currentDraws, lottery]);

  function formatNumber(n) {
    return String(n).padStart(2, "0");
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  function selectLottery(id) {
    setSelected(id);
    setMessage("");
  }

  // 保存开奖数据
  function addDraw(event) {
    event.preventDefault();

    setMessage("");

    const raw = numbersInput.trim();

    let numberList;

    // 北部、南部、中部彩票支持12位连续输入
    if (
      /^\d{12}$/.test(raw) &&
      ["XSMB", "XSMN", "XSMT"].includes(selected)
    ) {
      numberList = raw.match(/\d{2}/g);
    } else {
      // 支持空格、逗号、中文逗号和分号
      numberList = raw
        .split(/[\s,，;；]+/)
        .filter(Boolean);
    }

    const numbers = numberList.map(Number);

    // 必须是6个号码
    if (numbers.length !== 6) {
      showMessage(
        "请输入准确的6个号码。北部、南部、中部支持连续12位输入；Mega和Power请用空格或逗号分隔。",
        "error"
      );
      return;
    }

    // 检查号码是否有效
    if (
      numbers.some(n =>
        !Number.isInteger(n) ||
        n < lottery.min ||
        n > lottery.max
      )
    ) {
      showMessage(
        `号码范围错误：${lottery.min} 至 ${lottery.max}`,
        "error"
      );
      return;
    }

    // 检查重复号码
    if (new Set(numbers).size !== 6) {
      showMessage("6个号码不能重复。", "error");
      return;
    }

    const newDraw = {
      id: Date.now(),
      date: drawDate || new Date().toLocaleDateString("en-CA"),
      numbers
    };

    setDraws(prev => ({
      ...prev,
      [selected]: [
        newDraw,
        ...(prev[selected] || [])
      ]
    }));

    setNumbersInput("");
    showMessage("开奖数据已成功保存到本机！");
  }

  // 删除单期开奖
  function deleteDraw(id) {
    if (!window.confirm("确定删除这条记录吗？")) return;

    setDraws(prev => ({
      ...prev,
      [selected]: (prev[selected] || []).filter(
        d => d.id !== id
      )
    }));

    showMessage("记录已删除。");
  }

  // 清空当前彩票数据
  function clearCurrent() {
    if (!window.confirm("确定清空当前彩票全部记录吗？")) return;

    setDraws(prev => ({
      ...prev,
      [selected]: []
    }));

    showMessage("当前彩票记录已清空。");
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

  const inputStyle = {
    width: "100%",
    padding: 13,
    margin: "8px 0 14px",
    boxSizing: "border-box",
    border: "1px solid #ccd5e0",
    borderRadius: 8,
    fontSize: 16
  };

  return (
    <main style={{
      minHeight: "100vh",
      padding: 16,
      background: "#f3f6fb",
      color: "#172033",
      fontFamily: "Arial, sans-serif"
    }}>

      <div style={{
        maxWidth: 1000,
        margin: "auto"
      }}>

        {/* 顶部 */}
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

          <small>VERSION 1.3 · DATA SAVE FIX</small>
        </header>

        {/* 彩票选择 */}
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
                  background: selected === item.id
                    ? "#174ea6"
                    : "#fff",
                  color: selected === item.id
                    ? "#fff"
                    : "#172033"
                }}
              >
                {item.id}

                <div style={{
                  fontSize: 12,
                  marginTop: 5
                }}>
                  {item.name}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 研究项目 */}
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
                  background: research === item
                    ? "#087f5b"
                    : "#fff",
                  color: research === item
                    ? "#fff"
                    : "#172033"
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* 当前状态 */}
        <section style={panel}>
          <h3>当前彩票：{selected}</h3>

          <p>研究项目：{research}</p>

          <p>已录入开奖期数：{currentDraws.length}</p>

          <p>
            号码范围：
            {formatNumber(lottery.min)} -
            {formatNumber(lottery.max)}
          </p>
        </section>

        {/* 录入数据 */}
        <section style={panel}>
          <h3>录入历史开奖数据</h3>

          <form onSubmit={addDraw}>
            <label>开奖日期</label>

            <input
              type="date"
              value={drawDate}
              onChange={e => setDrawDate(e.target.value)}
              style={inputStyle}
            />

            <label>输入6个号码</label>

            <input
              type="text"
              value={numbersInput}
              onChange={e => setNumbersInput(e.target.value)}
              placeholder={
                ["XSMB", "XSMN", "XSMT"].includes(selected)
                  ? "031218253644"
                  : "03 12 18 25 36 44"
              }
              inputMode="numeric"
              style={inputStyle}
            />

            <button
              type="submit"
              style={{
                ...button,
                width: "100%",
                background: "#174ea6",
                color: "#fff",
                border: "none",
                fontSize: 16
              }}
            >
              保存开奖数据
            </button>
          </form>

          {message && (
            <p style={{
              color: messageType === "error"
                ? "#b42318"
                : "#087f5b",
              fontWeight: "bold",
              padding: 10,
              background: messageType === "error"
                ? "#fff0f0"
                : "#e9f8f0",
              borderRadius: 8
            }}>
              {message}
            </p>
          )}

          <small>
            当前版本每期开奖录入6个号码，仅用于基础统计测试。
            越南传统彩票完整奖项结构尚未接入。
          </small>
        </section>

        {/* 统计结果 */}
        <section style={panel}>
          <h3>{research}</h3>

          {currentDraws.length === 0 ? (
            <p>等待导入历史开奖数据，请先录入开奖记录。</p>
          ) : (
            <>
              {research === "热门号码" &&
                stats.hot.map(n => (
                  <span
                    key={n}
                    style={{
                      display: "inline-block",
                      padding: 12,
                      margin: 5,
                      borderRadius: "50%",
                      background: "#e3f2fd",
                      color: "#174ea6"
                    }}
                  >
                    {formatNumber(n)}
                    {" "}({stats.frequency[n]})
                  </span>
                ))
              }

              {research === "冷门号码" &&
                stats.cold.map(n => (
                  <span
                    key={n}
                    style={{
                      display: "inline-block",
                      padding: 12,
                      margin: 5,
                      borderRadius: "50%",
                      background: "#fff0e6",
                      color: "#b45309"
                    }}
                  >
                    {formatNumber(n)}
                    {" "}({stats.frequency[n]})
                  </span>
                ))
              }

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
                const nums = currentDraws.flatMap(
                  d => d.numbers
                );

                const odd = nums.filter(
                  n => n % 2 !== 0
                ).length;

                const even = nums.length - odd;

                const middle = (
                  lottery.min + lottery.max
                ) / 2;

                const big = nums.filter(
                  n => n > middle
                ).length;

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

        {/* 历史记录 */}
        <section style={panel}>
          <h3>历史开奖记录</h3>

          {currentDraws.length === 0 ? (
            <p>暂无历史记录。</p>
          ) : (
            currentDraws.map(draw => (
              <div
                key={draw.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <strong>{draw.date}</strong>

                <div style={{ margin: "8px 0" }}>
                  {draw.numbers.map((n, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: 9,
                        margin: 3,
                        borderRadius: "50%",
                        background: "#edf3ff",
                        color: "#174ea6"
                      }}
                    >
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

        {/* 说明 */}
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
          VIETNAM AI LOTTERY PRO V1.3
        </footer>

      </div>
    </main>
  );
}
