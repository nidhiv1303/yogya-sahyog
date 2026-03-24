import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from core.retriever import retrieve

# ── GROUND TRUTH ─────────────────────────────────────────────────────────────
TEST_CASES = [
    {
        "label": "OBC Farmer\nGujarat",
        "profile": {
            "age": 45, "occupation": "farmer", "state": "Gujarat",
            "land_acres": 2, "annual_income_inr": 140000,
            "caste_category": "OBC", "need_categories": ["agriculture"],
            "documents_available": ["aadhaar", "income_certificate"]
        },
        "expected_keywords": ["kisan", "pm-kisan", "agriculture", "farmer", "fasal", "crop", "agri"]
    },
    {
        "label": "Young Student\nRajasthan",
        "profile": {
            "age": 19, "occupation": "student", "state": "Rajasthan",
            "land_acres": 0, "annual_income_inr": 80000,
            "caste_category": "SC", "need_categories": ["education"],
            "documents_available": ["aadhaar", "income_certificate"]
        },
        "expected_keywords": ["scholarship", "education", "student", "college", "sc", "obc", "merit"]
    },
    {
        "label": "Daily Wage Worker\nMaharashtra",
        "profile": {
            "age": 35, "occupation": "daily wage worker", "state": "Maharashtra",
            "land_acres": 0, "annual_income_inr": 60000,
            "caste_category": "General", "need_categories": ["employment", "health"],
            "documents_available": ["aadhaar"]
        },
        "expected_keywords": ["employment", "labour", "health", "ayushman", "worker", "wage", "nrega"]
    },
    {
        "label": "Widow\nUttar Pradesh",
        "profile": {
            "age": 52, "occupation": "unemployed", "state": "Uttar Pradesh",
            "land_acres": 0, "annual_income_inr": 30000,
            "caste_category": "OBC", "need_categories": ["housing", "health"],
            "documents_available": ["aadhaar", "income_certificate"]
        },
        "expected_keywords": ["pension", "widow", "housing", "awas", "health", "social", "welfare"]
    },
    {
        "label": "Small Business\nDelhi",
        "profile": {
            "age": 30, "occupation": "small business owner", "state": "Delhi",
            "land_acres": 0, "annual_income_inr": 250000,
            "caste_category": "General", "need_categories": ["employment"],
            "documents_available": ["aadhaar", "income_certificate"]
        },
        "expected_keywords": ["mudra", "msme", "loan", "business", "entrepreneur", "startup", "finance"]
    },
]

IDEAL = {
    "precision":    0.80,
    "recall":       0.75,
    "avg_score":    0.72,
    "latency_ms":   3000,
    "score_std":    0.10,
    "strong_ratio": 0.60,
}

print("Running RAG evaluation across all test cases...\n")
results = []

for tc in TEST_CASES:
    start = time.time()
    chunks = retrieve(tc["profile"])
    latency_ms = (time.time() - start) * 1000

    scores       = [c["score"] for c in chunks]
    scheme_texts = [
        (c["metadata"]["scheme_name"] + " " + c["text"]).lower()
        for c in chunks
    ]

    relevant_retrieved = sum(
        1 for text in scheme_texts
        if any(kw in text for kw in tc["expected_keywords"])
    )
    precision = relevant_retrieved / len(chunks) if chunks else 0

    covered_keywords = sum(
        1 for kw in tc["expected_keywords"]
        if any(kw in text for text in scheme_texts)
    )
    recall = covered_keywords / len(tc["expected_keywords"])

    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0
    strong_ratio = sum(1 for s in scores if s >= 0.65) / len(scores) if scores else 0

    results.append({
        "label":        tc["label"],
        "precision":    round(precision, 3),
        "recall":       round(recall, 3),
        "f1":           round(f1, 3),
        "avg_score":    round(np.mean(scores), 3),
        "score_std":    round(np.std(scores), 3),
        "latency_ms":   round(latency_ms, 1),
        "strong_ratio": round(strong_ratio, 3),
        "num_chunks":   len(chunks),
        "scores":       scores,
    })

    print(f"[{tc['label'].replace(chr(10), ' ')}]")
    print(f"  Precision   : {precision:.3f}  (ideal >= {IDEAL['precision']})")
    print(f"  Recall      : {recall:.3f}  (ideal >= {IDEAL['recall']})")
    print(f"  F1 Score    : {f1:.3f}")
    print(f"  Avg Score   : {np.mean(scores):.3f}  (ideal >= {IDEAL['avg_score']})")
    print(f"  Latency     : {latency_ms:.0f}ms  (ideal <= {IDEAL['latency_ms']}ms)")
    print(f"  Strong ratio: {strong_ratio:.3f}  (ideal >= {IDEAL['strong_ratio']})")
    print()

avg_precision    = np.mean([r["precision"]    for r in results])
avg_recall       = np.mean([r["recall"]       for r in results])
avg_f1           = np.mean([r["f1"]           for r in results])
avg_score        = np.mean([r["avg_score"]    for r in results])
avg_latency      = np.mean([r["latency_ms"]   for r in results])
avg_strong_ratio = np.mean([r["strong_ratio"] for r in results])
avg_std          = np.mean([r["score_std"]    for r in results])

print("=" * 50)
print("OVERALL SYSTEM PERFORMANCE")
print("=" * 50)
print(f"  Avg Precision : {avg_precision:.3f}  (ideal >= {IDEAL['precision']})")
print(f"  Avg Recall    : {avg_recall:.3f}  (ideal >= {IDEAL['recall']})")
print(f"  Avg F1        : {avg_f1:.3f}")
print(f"  Avg Score     : {avg_score:.3f}  (ideal >= {IDEAL['avg_score']})")
print(f"  Avg Latency   : {avg_latency:.0f}ms  (ideal <= {IDEAL['latency_ms']}ms)")
print(f"  Strong ratio  : {avg_strong_ratio:.3f}  (ideal >= {IDEAL['strong_ratio']})")
print()

labels     = [r["label"] for r in results]
precisions = [r["precision"]    for r in results]
recalls    = [r["recall"]       for r in results]
f1s        = [r["f1"]           for r in results]
avg_scores = [r["avg_score"]    for r in results]
latencies  = [r["latency_ms"]   for r in results]
stds       = [r["score_std"]    for r in results]
strong     = [r["strong_ratio"] for r in results]

x   = np.arange(len(labels))
fig = plt.figure(figsize=(22, 18))
fig.suptitle("PolicyPilot — RAG Accuracy & Efficiency Evaluation", fontsize=18, fontweight="bold", y=0.99)
gs  = gridspec.GridSpec(3, 3, figure=fig, hspace=0.5, wspace=0.4)
BAR_W = 0.25

def bar_color(val, ideal, higher_is_better=True):
    if higher_is_better:
        if val >= ideal:           return "#2ecc71"
        elif val >= ideal * 0.80:  return "#f39c12"
        else:                      return "#e74c3c"
    else:
        if val <= ideal:           return "#2ecc71"
        elif val <= ideal * 1.25:  return "#f39c12"
        else:                      return "#e74c3c"

ax1 = fig.add_subplot(gs[0, :2])
b1 = ax1.bar(x - BAR_W, precisions, BAR_W, label="Precision",
             color=[bar_color(v, IDEAL["precision"]) for v in precisions], edgecolor="white")
b2 = ax1.bar(x,          recalls,   BAR_W, label="Recall",
             color=[bar_color(v, IDEAL["recall"]) for v in recalls], edgecolor="white", alpha=0.85)
b3 = ax1.bar(x + BAR_W,  f1s,       BAR_W, label="F1 Score",
             color="#7B68EE", edgecolor="white", alpha=0.85)
for bars in [b1, b2, b3]:
    for bar in bars:
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                 f"{bar.get_height():.2f}", ha="center", va="bottom", fontsize=7.5, fontweight="bold")
ax1.axhline(IDEAL["precision"], color="green",  linestyle="--", linewidth=1.2, alpha=0.6, label=f"Ideal precision ({IDEAL['precision']})")
ax1.axhline(IDEAL["recall"],    color="blue",   linestyle="--", linewidth=1.2, alpha=0.6, label=f"Ideal recall ({IDEAL['recall']})")
ax1.set_xticks(x)
ax1.set_xticklabels(labels, fontsize=8)
ax1.set_ylim(0, 1.15)
ax1.set_ylabel("Score (0-1)", fontsize=10)
ax1.set_title("Precision, Recall and F1 per Test Case", fontsize=12, fontweight="bold")
ax1.legend(fontsize=7.5, ncol=2)
ax1.grid(axis="y", alpha=0.3)

ax2 = fig.add_subplot(gs[0, 2], polar=True)
radar_metrics = ["Precision", "Recall", "F1", "Avg Score", "Strong\nRatio"]
actual_vals   = [avg_precision, avg_recall, avg_f1, avg_score, avg_strong_ratio]
ideal_vals    = [IDEAL["precision"], IDEAL["recall"],
                 (2*IDEAL["precision"]*IDEAL["recall"])/(IDEAL["precision"]+IDEAL["recall"]),
                 IDEAL["avg_score"], IDEAL["strong_ratio"]]
N     = len(radar_metrics)
theta = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
theta += theta[:1]
actual_vals_plot = actual_vals + actual_vals[:1]
ideal_vals_plot  = ideal_vals  + ideal_vals[:1]
ax2.set_theta_offset(np.pi / 2)
ax2.set_theta_direction(-1)
ax2.plot(theta, ideal_vals_plot,  "g--", linewidth=1.5, alpha=0.7, label="Ideal")
ax2.fill(theta, ideal_vals_plot,  alpha=0.1, color="green")
ax2.plot(theta, actual_vals_plot, "b-",  linewidth=2,   label="Actual")
ax2.fill(theta, actual_vals_plot, alpha=0.25, color="blue")
ax2.set_xticks(theta[:-1])
ax2.set_xticklabels(radar_metrics, fontsize=8)
ax2.set_ylim(0, 1)
ax2.set_title("System vs Ideal\n(Radar)", fontsize=11, fontweight="bold", pad=15)
ax2.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), fontsize=8)

ax3 = fig.add_subplot(gs[1, 0])
colors3 = [bar_color(v, IDEAL["avg_score"]) for v in avg_scores]
bars3   = ax3.bar(labels, avg_scores, color=colors3, edgecolor="white", linewidth=0.8)
ax3.axhline(IDEAL["avg_score"], color="green", linestyle="--", linewidth=1.5,
            label=f"Ideal ({IDEAL['avg_score']})", alpha=0.8)
for bar, val in zip(bars3, avg_scores):
    ax3.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005,
             f"{val:.3f}", ha="center", fontsize=8, fontweight="bold")
ax3.set_ylim(0, 1.0)
ax3.set_ylabel("Avg Cosine Score", fontsize=9)
ax3.set_title("Average Relevance Score\nper Profile", fontsize=11, fontweight="bold")
ax3.tick_params(axis="x", labelsize=7)
ax3.legend(fontsize=8)
ax3.grid(axis="y", alpha=0.3)

ax4 = fig.add_subplot(gs[1, 1])
colors4 = [bar_color(v, IDEAL["latency_ms"], higher_is_better=False) for v in latencies]
bars4   = ax4.bar(labels, latencies, color=colors4, edgecolor="white", linewidth=0.8)
ax4.axhline(IDEAL["latency_ms"], color="green", linestyle="--", linewidth=1.5,
            label=f"Ideal (<={IDEAL['latency_ms']}ms)", alpha=0.8)
for bar, val in zip(bars4, latencies):
    ax4.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 20,
             f"{val:.0f}ms", ha="center", fontsize=8, fontweight="bold")
ax4.set_ylabel("Response time (ms)", fontsize=9)
ax4.set_title("Retrieval Latency\nper Profile", fontsize=11, fontweight="bold")
ax4.tick_params(axis="x", labelsize=7)
ax4.legend(fontsize=8)
ax4.grid(axis="y", alpha=0.3)

ax5 = fig.add_subplot(gs[1, 2])
colors5 = [bar_color(v, IDEAL["score_std"], higher_is_better=False) for v in stds]
bars5   = ax5.bar(labels, stds, color=colors5, edgecolor="white", linewidth=0.8)
ax5.axhline(IDEAL["score_std"], color="green", linestyle="--", linewidth=1.5,
            label=f"Ideal std (<={IDEAL['score_std']})", alpha=0.8)
for bar, val in zip(bars5, stds):
    ax5.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.002,
             f"{val:.3f}", ha="center", fontsize=8, fontweight="bold")
ax5.set_ylabel("Std Deviation", fontsize=9)
ax5.set_title("Score Consistency\n(lower = more consistent)", fontsize=11, fontweight="bold")
ax5.tick_params(axis="x", labelsize=7)
ax5.legend(fontsize=8)
ax5.grid(axis="y", alpha=0.3)

ax6 = fig.add_subplot(gs[2, 0])
colors6 = [bar_color(v, IDEAL["strong_ratio"]) for v in strong]
bars6   = ax6.bar(labels, strong, color=colors6, edgecolor="white", linewidth=0.8)
ax6.axhline(IDEAL["strong_ratio"], color="green", linestyle="--", linewidth=1.5,
            label=f"Ideal ({IDEAL['strong_ratio']})", alpha=0.8)
for bar, val in zip(bars6, strong):
    ax6.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
             f"{val:.0%}", ha="center", fontsize=8, fontweight="bold")
ax6.set_ylim(0, 1.1)
ax6.set_ylabel("Ratio of chunks >= 0.65", fontsize=9)
ax6.set_title("Strong Match Ratio\nper Profile", fontsize=11, fontweight="bold")
ax6.tick_params(axis="x", labelsize=7)
ax6.legend(fontsize=8)
ax6.grid(axis="y", alpha=0.3)

ax7 = fig.add_subplot(gs[2, 1])
score_lists = [r["scores"] for r in results]
bp = ax7.boxplot(score_lists, labels=labels, patch_artist=True, notch=False,
                 medianprops={"color": "black", "linewidth": 2})
box_colors = ["#4A90D9", "#E8834A", "#2ecc71", "#9B59B6", "#E74C3C"]
for patch, color in zip(bp["boxes"], box_colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)
ax7.axhline(IDEAL["avg_score"], color="green", linestyle="--",
            linewidth=1.5, alpha=0.7, label=f"Ideal avg ({IDEAL['avg_score']})")
ax7.set_ylabel("Score distribution", fontsize=9)
ax7.set_title("Score Spread per Profile\n(box plot)", fontsize=11, fontweight="bold")
ax7.tick_params(axis="x", labelsize=7)
ax7.legend(fontsize=8)
ax7.grid(axis="y", alpha=0.3)

ax8 = fig.add_subplot(gs[2, 2])
ax8.axis("off")

def status(val, ideal, higher=True):
    if higher:
        if val >= ideal:          return "PASS", "#2ecc71"
        elif val >= ideal * 0.80: return "CLOSE", "#f39c12"
        else:                     return "FAIL",  "#e74c3c"
    else:
        if val <= ideal:          return "PASS", "#2ecc71"
        elif val <= ideal * 1.25: return "CLOSE", "#f39c12"
        else:                     return "FAIL",  "#e74c3c"

scorecard = [
    ("Metric",        "Actual", "Ideal",  "Status"),
    ("Precision",     f"{avg_precision:.3f}",    f">={IDEAL['precision']}",     status(avg_precision,    IDEAL["precision"])[0]),
    ("Recall",        f"{avg_recall:.3f}",        f">={IDEAL['recall']}",        status(avg_recall,       IDEAL["recall"])[0]),
    ("F1 Score",      f"{avg_f1:.3f}",            "--",                          "INFO"),
    ("Avg Cos Score", f"{avg_score:.3f}",         f">={IDEAL['avg_score']}",     status(avg_score,        IDEAL["avg_score"])[0]),
    ("Latency",       f"{avg_latency:.0f}ms",     f"<={IDEAL['latency_ms']}ms",  status(avg_latency,      IDEAL["latency_ms"], higher=False)[0]),
    ("Consistency",   f"s={avg_std:.3f}",         f"s<={IDEAL['score_std']}",    status(avg_std,          IDEAL["score_std"],  higher=False)[0]),
    ("Strong Ratio",  f"{avg_strong_ratio:.3f}",  f">={IDEAL['strong_ratio']}",  status(avg_strong_ratio, IDEAL["strong_ratio"])[0]),
]

status_color_map = {"PASS": "#2ecc71", "CLOSE": "#f39c12", "FAIL": "#e74c3c", "INFO": "#7B68EE"}

table = ax8.table(cellText=scorecard[1:], colLabels=scorecard[0],
                  cellLoc="center", loc="center", colWidths=[0.32, 0.22, 0.22, 0.22])
table.auto_set_font_size(False)
table.set_fontsize(8.5)
table.scale(1, 1.65)
for (row, col), cell in table.get_celld().items():
    if row == 0:
        cell.set_facecolor("#2C2C5E")
        cell.set_text_props(color="white", fontweight="bold")
    elif col == 3 and row > 0:
        status_text = scorecard[row][3]
        cell.set_facecolor(status_color_map.get(status_text, "white"))
        cell.set_text_props(fontweight="bold", color="white")
    elif row % 2 == 0:
        cell.set_facecolor("#F0F0FF")
    cell.set_edgecolor("#DDDDDD")
ax8.set_title("Overall Scorecard", fontsize=11, fontweight="bold", pad=15)

plt.savefig("rag_evaluation.png", dpi=150, bbox_inches="tight")
print("Saved to rag_evaluation.png")
plt.show()
