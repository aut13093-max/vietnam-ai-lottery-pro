
"use client";

import { useState } from "react";

const lotteryTypes = [
  { id: "XSMB", name: "XSMB 北部彩票", range: "00–99" },
  { id: "XSMN", name: "XSMN 南部彩票", range: "00–99" },
  { id: "XSMT", name: "XSMT 中部彩票", range: "00–99" },
  { id: "MEGA", name: "Vietlott Mega 6/45", range: "01–45" },
  { id: "POWER", name: "Vietlott Power 6/55", range: "01–55" }
];

export default function Home() {
  const [selected, setSelected] = useState("XSMB");
  const [mode, setMode] = useState("hot");

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5">
      <div className="max-w-4xl mx-auto">

        <header className="mb-8">
          <p className="text-cyan-400 text-sm">
            AI STATISTICS PLATFORM
          </p>
          <h1 className="text-3xl font-bold mt-2">
            VIETNAM AI LOTTERY PRO
          </h1>
          <p className="text-slate-400 mt-2">
            越南全类型彩票数据统计与研究平台
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 mb-8">
          {lotteryTypes.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`rounded-xl p-4 text-left border ${
                selected === item.id
                  ? "border-cyan-400 bg-cyan-950"
                  : "border-slate-700 bg-slate-900"
              }`}
            >
              <div className="font-bold">{item.id}</div>
              <div className="text-sm text-slate-300 mt-2">
                {item.name}
              </div>
              <div className="text-xs text-cyan-400 mt-2">
                号码范围：{item.range}
              </div>
            </button>
          ))}
        </section>

        <section className="bg-slate-900 rounded-xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">
            AI 号码统计研究
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("hot")}
              className="bg-slate-800 rounded-lg p-3"
            >
              🔥 热门号码
            </button>

            <button
              onClick={() => setMode("cold")}
              className="bg-slate-800 rounded-lg p-3"
            >
              ❄️ 冷门号码
            </button>

            <button
              onClick={() => setMode("missing")}
              className="bg-slate-800 rounded-lg p-3"
            >
              📉 遗漏统计
            </button>

            <button
              onClick={() => setMode("trend")}
              className="bg-slate-800 rounded-lg p-3"
            >
              📊 奇偶大小分析
            </button>
          </div>

          <div className="mt-5 bg-slate-800 rounded-lg p-4">
            <p className="text-cyan-400 font-bold">
              当前彩票：{selected}
            </p>
            <p className="mt-3 text-white">
              当前研究项目：
              {mode === "hot" && "热门号码统计"}
              {mode === "cold" && "冷门号码统计"}
              {mode === "missing" && "号码遗漏统计"}
              {mode === "trend" && "奇偶大小分析"}
            </p>
            <p className="text-sm text-slate-400 mt-3">
              等待导入真实历史开奖数据。
            </p>
          </div>
        </section>

        <section className="bg-slate-900 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-3">
            AI 研究说明
          </h2>
          <p className="text-slate-400 text-sm leading-7">
            系统将根据真实历史开奖数据进行频率、
            遗漏、组合和趋势统计。统计结果仅供研究，
            不代表下一期中奖概率提高。
          </p>
        </section>

        <footer className="text-center text-slate-500 text-xs mt-8">
          VIETNAM AI LOTTERY PRO V1.0
        </footer>

      </div>
    </main>
  );
}
