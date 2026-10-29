"""
Macro-to-Cart & Fridge Inventory Orchestrator
Connects athletic training demands to daily macronutrient targets,
tracks pantry/fridge stock seeded from Intermarché receipts,
and generates aisle-organized grocery restock lists with Apple Reminders export.
"""

from __future__ import annotations
import json
import os
from datetime import datetime, date
from pathlib import Path
from zoneinfo import ZoneInfo

LOCAL_TZ = ZoneInfo("Europe/Paris")
BASE_DIR = Path(__file__).resolve().parent
CAL_DATA_DIR = BASE_DIR / "legacy_calendar" / "calendar_data" if (BASE_DIR / "legacy_calendar" / "calendar_data").exists() else BASE_DIR / "calendar_data"
INVENTORY_FILE = CAL_DATA_DIR / "fridge_inventory.json"

# Seeding baseline extracted from Intermarché Drive receipt (26 Oct 2026, Paris 19e, 193.94€)
INTERMARCHE_BASELINE = [
    {
        "id": "poulet_filet",
        "name": "Blancs de Poulet (Filets)",
        "category": "Boucherie & Volailles",
        "icon": "🍗",
        "unit": "kg",
        "initial_qty": 5.0,
        "current_qty": 4.5,
        "min_qty": 1.5,
        "brand": "Notre Sélection Intermarché",
        "macros_per_100g": {"protein": 23, "carbs": 0, "fat": 1.5, "kcal": 110},
        "daily_target_usage": 0.5,
        "storage": "Congélateur / Zip Alfapac"
    },
    {
        "id": "boeuf_hache_5",
        "name": "Bœuf Haché Pur 5% MG",
        "category": "Boucherie & Volailles",
        "icon": "🥩",
        "unit": "kg",
        "initial_qty": 1.5,
        "current_qty": 1.5,
        "min_qty": 0.8,
        "brand": "Jean Rozé (3x500g)",
        "macros_per_100g": {"protein": 21, "carbs": 0, "fat": 5, "kcal": 130},
        "daily_target_usage": 0.35,
        "storage": "Frais / Congélateur"
    },
    {
        "id": "steaks_bovins",
        "name": "Steaks Hachés Bovins (x12)",
        "category": "Boucherie & Volailles",
        "icon": "🍔",
        "unit": "pièces",
        "initial_qty": 12,
        "current_qty": 12,
        "min_qty": 4,
        "brand": "Petit Prix (3 barquettes de 4)",
        "macros_per_100g": {"protein": 19, "carbs": 0, "fat": 12, "kcal": 185},
        "daily_target_usage": 2,
        "storage": "Congélateur"
    },
    {
        "id": "cotes_porc",
        "name": "Côtes de Porc sans os (x12)",
        "category": "Boucherie & Volailles",
        "icon": "🍖",
        "unit": "pièces",
        "initial_qty": 12,
        "current_qty": 12,
        "min_qty": 4,
        "brand": "Terroirs Intermarché (3x4)",
        "macros_per_100g": {"protein": 22, "carbs": 0, "fat": 8, "kcal": 160},
        "daily_target_usage": 2,
        "storage": "Congélateur"
    },
    {
        "id": "paves_truite",
        "name": "Pavés de Truite Frais (x6)",
        "category": "Poissonnerie & Oméga-3",
        "icon": "🐟",
        "unit": "pièces",
        "initial_qty": 6,
        "current_qty": 6,
        "min_qty": 2,
        "brand": "Terroirs Intermarché (3x2)",
        "macros_per_100g": {"protein": 20, "carbs": 0, "fat": 7, "kcal": 145},
        "daily_target_usage": 1,
        "storage": "Frais / Congélateur"
    },
    {
        "id": "skyr_nature",
        "name": "Skyr Nature 0% MG (Pots 850g)",
        "category": "Produits Laitiers & Protéines",
        "icon": "🥛",
        "unit": "pots",
        "initial_qty": 6,
        "current_qty": 5,
        "min_qty": 2,
        "brand": "Pâturages Intermarché (5.1 kg total)",
        "macros_per_100g": {"protein": 10, "carbs": 4, "fat": 0.2, "kcal": 57},
        "daily_target_usage": 0.75,
        "storage": "Réfrigérateur"
    },
    {
        "id": "brocolis_vapeur",
        "name": "Brocolis Fleurettes Vapeur Surgelés",
        "category": "Légumes & Surgelés",
        "icon": "🥦",
        "unit": "sachets",
        "initial_qty": 1,
        "current_qty": 1,
        "min_qty": 2,
        "brand": "Saint Eloi Surgelé (540g)",
        "macros_per_100g": {"protein": 3, "carbs": 2.5, "fat": 0.5, "kcal": 28},
        "daily_target_usage": 0.5,
        "storage": "Congélateur"
    },
    {
        "id": "haricots_verts",
        "name": "Haricots Verts Très Fins",
        "category": "Légumes & Surgelés",
        "icon": "🫘",
        "unit": "sachets (1kg)",
        "initial_qty": 1,
        "current_qty": 1,
        "min_qty": 1,
        "brand": "Top Budget (1 kg)",
        "macros_per_100g": {"protein": 2, "carbs": 3.5, "fat": 0.2, "kcal": 25},
        "daily_target_usage": 0.35,
        "storage": "Congélateur"
    },
    {
        "id": "poivrons_trio",
        "name": "Trio de Poivrons en Lanières",
        "category": "Légumes & Surgelés",
        "icon": "🫑",
        "unit": "sachets (600g)",
        "initial_qty": 0,
        "current_qty": 0,
        "min_qty": 2,
        "brand": "Saint Eloi (Rupture ticket 26-Oct)",
        "macros_per_100g": {"protein": 1.2, "carbs": 4.5, "fat": 0.3, "kcal": 26},
        "daily_target_usage": 0.3,
        "storage": "Congélateur"
    },
    {
        "id": "oignons_bio",
        "name": "Oignons Jaunes Bio",
        "category": "Fruits & Légumes Frais",
        "icon": "🧅",
        "unit": "filet (1kg)",
        "initial_qty": 1,
        "current_qty": 1,
        "min_qty": 0.5,
        "brand": "Mon Marché Plaisir Bio",
        "macros_per_100g": {"protein": 1.1, "carbs": 9, "fat": 0.1, "kcal": 40},
        "daily_target_usage": 0.15,
        "storage": "Cellier"
    },
    {
        "id": "kiwis_verts",
        "name": "Kiwis Verts Frais",
        "category": "Fruits & Légumes Frais",
        "icon": "🥝",
        "unit": "pièces",
        "initial_qty": 6,
        "current_qty": 5,
        "min_qty": 3,
        "brand": "Le Choix du Primeur",
        "macros_per_100g": {"protein": 1.1, "carbs": 14, "fat": 0.5, "kcal": 61},
        "daily_target_usage": 1,
        "storage": "Corbeille fruits"
    },
    {
        "id": "pates_penne",
        "name": "Pâtes Penne Rigate (2 kg)",
        "category": "Féculents & Épicerie",
        "icon": "🍝",
        "unit": "paquets (1kg)",
        "initial_qty": 2,
        "current_qty": 2,
        "min_qty": 1,
        "brand": "Barilla (2x1kg)",
        "macros_per_100g": {"protein": 12.5, "carbs": 71, "fat": 2, "kcal": 355},
        "daily_target_usage": 0.15,
        "storage": "Placard Épicerie"
    },
    {
        "id": "pates_farfalle",
        "name": "Pâtes Farfalle Generose (1 kg)",
        "category": "Féculents & Épicerie",
        "icon": "🎀",
        "unit": "paquets (500g)",
        "initial_qty": 2,
        "current_qty": 2,
        "min_qty": 1,
        "brand": "Barilla Collezione (2x500g)",
        "macros_per_100g": {"protein": 12.5, "carbs": 71, "fat": 2, "kcal": 355},
        "daily_target_usage": 0.15,
        "storage": "Placard Épicerie"
    },
    {
        "id": "riz_basmati",
        "name": "Riz Basmati (1 kg)",
        "category": "Féculents & Épicerie",
        "icon": "🍚",
        "unit": "sachets (500g)",
        "initial_qty": 2,
        "current_qty": 2,
        "min_qty": 1,
        "brand": "Taureau Ailé (2x500g)",
        "macros_per_100g": {"protein": 8.5, "carbs": 77, "fat": 1, "kcal": 350},
        "daily_target_usage": 0.15,
        "storage": "Placard Épicerie"
    },
    {
        "id": "tomates_mutti",
        "name": "Pulpe Fine de Tomates (x4)",
        "category": "Féculents & Épicerie",
        "icon": "🥫",
        "unit": "pots (210g)",
        "initial_qty": 4,
        "current_qty": 4,
        "min_qty": 2,
        "brand": "Mutti (2 packs de 2)",
        "macros_per_100g": {"protein": 1.2, "carbs": 3.9, "fat": 0.2, "kcal": 26},
        "daily_target_usage": 0.5,
        "storage": "Placard Épicerie"
    },
    {
        "id": "sauce_soja",
        "name": "Sauce Soja Réduite en Sel",
        "category": "Féculents & Épicerie",
        "icon": "🥢",
        "unit": "flacons",
        "initial_qty": 1,
        "current_qty": 1,
        "min_qty": 0.5,
        "brand": "Tanoshi 200ml",
        "macros_per_100g": {"protein": 8.8, "carbs": 8, "fat": 0, "kcal": 75},
        "daily_target_usage": 0.05,
        "storage": "Réfrigérateur"
    },
    {
        "id": "sacs_alfapac",
        "name": "Sacs Congélation Zip (x30)",
        "category": "Consommables & Meal Prep",
        "icon": "🛍️",
        "unit": "boîte",
        "initial_qty": 1,
        "current_qty": 1,
        "min_qty": 0.3,
        "brand": "Alfapac Moyen Modèle",
        "daily_target_usage": 0.1,
        "storage": "Tiroir Cuisine"
    }
]

def init_or_load_inventory() -> list[dict]:
    CAL_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not INVENTORY_FILE.exists():
        with open(INVENTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(INTERMARCHE_BASELINE, f, indent=2, ensure_ascii=False)
        return INTERMARCHE_BASELINE
    
    try:
        with open(INVENTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return INTERMARCHE_BASELINE

def get_daily_macro_targets(dow: int) -> dict:
    """
    Calculates exact macronutrient demands based on the microcycle daily workout:
    Athlete weight: 80.1 kg (target: 85.0 kg competition standard)
    Target protein: 2.2 g/kg = ~176 g/day
    """
    # 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    # Double days: Wed (CrossFit + Run 1), Fri (CrossFit + Run 2)
    # Heavy Gym: Tue (Squats + S2O), Thu (Deadlift + Bench)
    # Single Metcon: Mon (CrossFit), Sat (Team WOD)
    # Recovery: Sun (Zone 2 5k)
    if dow in (2, 4):  # Wednesday / Friday (Double Sessions)
        return {
            "day_type": "🔥 Double Session Day (CrossFit + Run)",
            "calories_target": 2950,
            "protein_target_g": 178,
            "carbs_target_g": 380,
            "fat_target_g": 65,
            "hydration_liters": 3.8,
            "key_fueling_window": "Intra/Post-CrossFit carb replenishment + Evening Pre-Run hydration"
        }
    elif dow in (1, 3):  # Tuesday / Thursday (Strength / Hypertrophy)
        return {
            "day_type": "🏋️ Lower/Upper Compound Strength Day",
            "calories_target": 2750,
            "protein_target_g": 176,
            "carbs_target_g": 330,
            "fat_target_g": 70,
            "hydration_liters": 3.2,
            "key_fueling_window": "Post-workout high protein pulse (45g) + Leucine threshold"
        }
    elif dow in (0, 5):  # Monday / Saturday (CrossFit Metcon)
        return {
            "day_type": "⚡ CrossFit High-Power Metcon Day",
            "calories_target": 2800,
            "protein_target_g": 175,
            "carbs_target_g": 350,
            "fat_target_g": 68,
            "hydration_liters": 3.5,
            "key_fueling_window": "Pre-WOD fast glycogen + Electrolyte replenishment"
        }
    else:  # Sunday (Active Recovery 5k)
        return {
            "day_type": "🌿 Active Recovery & Glycogen Rebalancing",
            "calories_target": 2400,
            "protein_target_g": 165,
            "carbs_target_g": 260,
            "fat_target_g": 65,
            "hydration_liters": 2.8,
            "key_fueling_window": "High micronutrient density + Gut recovery"
        }

def generate_aisle_grocery_list(inventory: list[dict] | None = None) -> dict[str, list[dict]]:
    """Generates supermarket checklist grouped by French grocery aisles."""
    if inventory is None:
        inventory = init_or_load_inventory()

    aisles = {
        "🥩 Boucherie & Volailles": [],
        "🥦 Fruits & Légumes / Surgelés": [],
        "🥛 Produits Laitiers Protéinés": [],
        "🌾 Épicerie Salée & Féculents": [],
        "🛍️ Maison & Batch Cooking": []
    }

    for item in inventory:
        cat = item.get("category", "")
        curr = item.get("current_qty", 0)
        min_q = item.get("min_qty", 0)
        is_low = curr <= min_q
        
        # Calculate days of supply left
        daily_usage = item.get("daily_target_usage", 0.5)
        days_left = round(curr / daily_usage, 1) if daily_usage > 0 else 99

        entry = {
            "id": item["id"],
            "name": item["name"],
            "icon": item.get("icon", "📦"),
            "current": curr,
            "unit": item.get("unit", ""),
            "min": min_q,
            "is_low": is_low,
            "days_left": days_left,
            "brand": item.get("brand", ""),
            "storage": item.get("storage", "")
        }

        if "Boucherie" in cat or "Poissonnerie" in cat:
            aisles["🥩 Boucherie & Volailles"].append(entry)
        elif "Légumes" in cat or "Fruits" in cat:
            aisles["🥦 Fruits & Légumes / Surgelés"].append(entry)
        elif "Laitiers" in cat:
            aisles["🥛 Produits Laitiers Protéinés"].append(entry)
        elif "Féculents" in cat or "Épicerie" in cat:
            aisles["🌾 Épicerie Salée & Féculents"].append(entry)
        else:
            aisles["🛍️ Maison & Batch Cooking"].append(entry)

    return aisles

def get_apple_reminders_export_text(inventory: list[dict] | None = None) -> str:
    """Generates plain text checklist formatted for 1-click paste into Apple Reminders."""
    aisles = generate_aisle_grocery_list(inventory)
    lines = ["🛒 ATHX / Macro-to-Cart Grocery List (Intermarché)"]
    lines.append(f"Date: {date.today().strftime('%d/%m/%Y')}\n")

    for aisle_name, items in aisles.items():
        # Items that are low or urgent come first
        urgent_items = [i for i in items if i["is_low"]]
        other_items = [i for i in items if not i["is_low"]]
        
        lines.append(f"[{aisle_name}]")
        if urgent_items:
            for it in urgent_items:
                lines.append(f"🔴 {it['name']} ({it['brand']}) - Réassort urgent (reste {it['current']} {it['unit']})")
        for it in other_items:
            lines.append(f"⚪ {it['name']} ({it['brand']}) - En stock: {it['current']} {it['unit']} (~{it['days_left']}j)")
        lines.append("")

    return "\n".join(lines)

if __name__ == "__main__":
    inv = init_or_load_inventory()
    print(f"Loaded {len(inv)} items from inventory.")
    today_dow = datetime.now(LOCAL_TZ).weekday()
    target = get_daily_macro_targets(today_dow)
    print(f"Today's Macro Target: {target['day_type']}")
    print(f"Calories: {target['calories_target']} kcal | Protein: {target['protein_target_g']}g | Carbs: {target['carbs_target_g']}g")
    print("\n--- Apple Reminders Export Preview ---")
    print(get_apple_reminders_export_text(inv)[:500] + "...")
