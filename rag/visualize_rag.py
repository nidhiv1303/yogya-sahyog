import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from rag.retriever import retrieve

profile = {
    "age": 45,
    "occupation": "farmer",
    "state": "Gujarat",
    "land_acres": 2,
    "annual_income_inr": 140000,
    "caste_category": "OBC",
    "need_categories": ["agriculture"],
    "documents_available": ["aadhaar", "income_certificate"]
}

print("Running retrieval...")
chunks = retrieve(profile)

# ── EXTRACT DATA ─────────────────────────────────────────────────────────────
scheme_names  = [c["metadata"]["scheme_name"][:25] for c in chunks]
scores        = [round(c["score"], 3) for c in chunks]
levels        = [c["metadata"]["level"] for c in chunks]
states        = [c["metadata"]["state"] for c in chunks]
queries       = [c["matched_query"] for c in chunks]

# Color maps
level_colors  = {"central": "#4A90D9", "state": "#E8834A"}
score_colors  = ["#2ecc71" if s >= 0.65 else "#f39c12" if s >= 0.50 else "#e74c3c" for s in scores]

fig = plt.figure(figsize=(20, 16))
fig.suptitle("PolicyPilot — RAG Retrieval Analysis", fontsize=18, fontweight="bold", y=0.98)

# ── CHART 1: Relevance scores bar chart ──────────────────────────────────────
ax1 = fig.add_subplot(3, 3, (1, 2))
bars = ax1.barh(scheme_names[::-1], scores[::-1], color=score_colors[::-1], edgecolor="white", linewidth=0.5)
ax1.set_xlabel("Relevance Score (cosine similarity)", fontsize=10)
ax1.set_title("Scheme Relevance Scores", fontsize=12, fontweight="bold")
ax1.set_xlim(0, 1.0)
ax1.axvline(x=0.65, color="green",  linestyle="--", linewidth=1, alpha=0.7, label="Strong (≥0.65)")
ax1.axvline(x=0.50, color="orange", linestyle="--", linewidth=1, alpha=0.7, label="Moderate (≥0.50)")
for bar, score in zip(bars, scores[::-1]):
    ax1.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height() / 2,
             f"{score:.3f}", va="center", fontsize=8)
ax1.legend(fontsize=8)
ax1.grid(axis="x", alpha=0.3)

# ── CHART 2: Central vs State pie chart ──────────────────────────────────────
ax2 = fig.add_subplot(3, 3, 3)
level_counts = {"central": levels.count("central"), "state": levels.count("state")}
wedge_colors = [level_colors["central"], level_colors["state"]]
wedges, texts, autotexts = ax2.pie(
    level_counts.values(),
    labels=[f"Central\n({level_counts['central']})", f"State\n({level_counts['state']})"],
    colors=wedge_colors,
    autopct="%1.0f%%",
    startangle=90,
    wedgeprops={"edgecolor": "white", "linewidth": 2}
)
for t in autotexts:
    t.set_fontsize(11)
    t.set_fontweight("bold")
ax2.set_title("Central vs State Schemes", fontsize=12, fontweight="bold")

# ── CHART 3: Score distribution histogram ────────────────────────────────────
ax3 = fig.add_subplot(3, 3, 4)
ax3.hist(scores, bins=8, color="#7B68EE", edgecolor="white", linewidth=0.8, alpha=0.85)
ax3.axvline(np.mean(scores), color="red",    linestyle="--", linewidth=1.5, label=f"Mean: {np.mean(scores):.3f}")
ax3.axvline(np.median(scores), color="blue", linestyle="--", linewidth=1.5, label=f"Median: {np.median(scores):.3f}")
ax3.set_xlabel("Relevance Score", fontsize=10)
ax3.set_ylabel("Number of chunks", fontsize=10)
ax3.set_title("Score Distribution", fontsize=12, fontweight="bold")
ax3.legend(fontsize=8)
ax3.grid(axis="y", alpha=0.3)

# ── CHART 4: Which query matched what ────────────────────────────────────────
ax4 = fig.add_subplot(3, 3, 5)
query_counts = {}
for q in queries:
    query_counts[q] = query_counts.get(q, 0) + 1
query_labels  = [q.replace("_", "\n") for q in query_counts.keys()]
query_values  = list(query_counts.values())
query_colors  = plt.cm.Set3(np.linspace(0, 1, len(query_counts)))
bars2 = ax4.bar(query_labels, query_values, color=query_colors, edgecolor="white", linewidth=0.8)
for bar, val in zip(bars2, query_values):
    ax4.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.05,
             str(val), ha="center", fontsize=9, fontweight="bold")
ax4.set_ylabel("Chunks matched", fontsize=10)
ax4.set_title("Matches per Query Type", fontsize=12, fontweight="bold")
ax4.tick_params(axis="x", labelsize=7)
ax4.grid(axis="y", alpha=0.3)

# ── CHART 5: State breakdown pie chart ───────────────────────────────────────
ax5 = fig.add_subplot(3, 3, 6)
state_counts = {}
for s in states:
    state_counts[s] = state_counts.get(s, 0) + 1
state_colors = plt.cm.Pastel1(np.linspace(0, 1, len(state_counts)))
wedges2, texts2, autotexts2 = ax5.pie(
    state_counts.values(),
    labels=state_counts.keys(),
    colors=state_colors,
    autopct="%1.0f%%",
    startangle=140,
    wedgeprops={"edgecolor": "white", "linewidth": 2}
)
for t in autotexts2:
    t.set_fontsize(9)
ax5.set_title("Geographic Coverage", fontsize=12, fontweight="bold")

# ── CHART 6: Score by level (grouped bar) ────────────────────────────────────
ax6 = fig.add_subplot(3, 3, 7)
central_scores = [s for s, l in zip(scores, levels) if l == "central"]
state_scores   = [s for s, l in zip(scores, levels) if l == "state"]
categories     = ["Min", "Max", "Mean"]
central_vals   = [min(central_scores) if central_scores else 0,
                  max(central_scores) if central_scores else 0,
                  round(np.mean(central_scores), 3) if central_scores else 0]
state_vals     = [min(state_scores) if state_scores else 0,
                  max(state_scores) if state_scores else 0,
                  round(np.mean(state_scores), 3) if state_scores else 0]
x = np.arange(len(categories))
w = 0.3
b1 = ax6.bar(x - w/2, central_vals, w, label="Central", color="#4A90D9", edgecolor="white")
b2 = ax6.bar(x + w/2, state_vals,   w, label="State",   color="#E8834A", edgecolor="white")
for bar in list(b1) + list(b2):
    ax6.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005,
             f"{bar.get_height():.2f}", ha="center", fontsize=8)
ax6.set_xticks(x)
ax6.set_xticklabels(categories)
ax6.set_ylabel("Score", fontsize=10)
ax6.set_title("Central vs State Score Comparison", fontsize=12, fontweight="bold")
ax6.legend(fontsize=9)
ax6.set_ylim(0, 1.0)
ax6.grid(axis="y", alpha=0.3)

# ── CHART 7: Quality tier pie ─────────────────────────────────────────────────
ax7 = fig.add_subplot(3, 3, 8)
strong   = sum(1 for s in scores if s >= 0.65)
moderate = sum(1 for s in scores if 0.50 <= s < 0.65)
weak     = sum(1 for s in scores if s < 0.50)
tier_labels = []
tier_values = []
tier_colors = []
if strong:
    tier_labels.append(f"Strong ≥0.65\n({strong})")
    tier_values.append(strong)
    tier_colors.append("#2ecc71")
if moderate:
    tier_labels.append(f"Moderate ≥0.50\n({moderate})")
    tier_values.append(moderate)
    tier_colors.append("#f39c12")
if weak:
    tier_labels.append(f"Weak <0.50\n({weak})")
    tier_values.append(weak)
    tier_colors.append("#e74c3c")
ax7.pie(tier_values, labels=tier_labels, colors=tier_colors,
        autopct="%1.0f%%", startangle=90,
        wedgeprops={"edgecolor": "white", "linewidth": 2})
ax7.set_title("Result Quality Tiers", fontsize=12, fontweight="bold")

# ── CHART 8: Summary stats table ──────────────────────────────────────────────
ax8 = fig.add_subplot(3, 3, 9)
ax8.axis("off")
stats = [
    ["Total schemes retrieved",   str(len(chunks))],
    ["Highest score",             f"{max(scores):.3f}"],
    ["Lowest score",              f"{min(scores):.3f}"],
    ["Average score",             f"{np.mean(scores):.3f}"],
    ["Strong matches (≥0.65)",    str(strong)],
    ["Moderate matches (≥0.50)",  str(moderate)],
    ["Weak matches (<0.50)",      str(weak)],
    ["Central schemes",           str(level_counts['central'])],
    ["State schemes",             str(level_counts['state'])],
    ["Unique query types hit",    str(len(query_counts))],
]
table = ax8.table(cellText=stats, colLabels=["Metric", "Value"],
                  cellLoc="left", loc="center",
                  colWidths=[0.65, 0.35])
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1, 1.5)
for (row, col), cell in table.get_celld().items():
    if row == 0:
        cell.set_facecolor("#4A4A8A")
        cell.set_text_props(color="white", fontweight="bold")
    elif row % 2 == 0:
        cell.set_facecolor("#F0F0F8")
    cell.set_edgecolor("#CCCCCC")
ax8.set_title("Summary Statistics", fontsize=12, fontweight="bold", pad=20)

plt.tight_layout(rect=[0, 0, 1, 0.97])
plt.savefig("rag_analysis.png", dpi=150, bbox_inches="tight")
print("\nSaved to rag_analysis.png")
plt.show()