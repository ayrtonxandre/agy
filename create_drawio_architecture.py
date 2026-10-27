#!/usr/bin/env python3
"""
Generate a professional, presentation-ready Draw.io diagram for the ATHX Project Architecture.
Tailored for a non-technical audience (executives, athletes, coaches, stakeholders).
"""

import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

def create_drawio():
    mxfile = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-10-23T14:45:00.000Z',
        'agent': 'Antigravity-ATHX',
        'version': '22.0.0',
        'type': 'device'
    })
    
    diagram = ET.SubElement(mxfile, 'diagram', {
        'id': 'athx-architecture-diagram',
        'name': 'ATHX Architecture Overview'
    })
    
    model = ET.SubElement(diagram, 'mxGraphModel', {
        'dx': '1800',
        'dy': '1100',
        'grid': '1',
        'gridSize': '10',
        'guides': '1',
        'tooltips': '1',
        'connect': '1',
        'arrows': '1',
        'fold': '1',
        'page': '1',
        'pageScale': '1',
        'pageWidth': '1800',
        'pageHeight': '1120',
        'background': '#F8FAFC',
        'math': '0',
        'shadow': '0'
    })
    
    root = ET.SubElement(model, 'root')
    ET.SubElement(root, 'mxCell', {'id': '0'})
    ET.SubElement(root, 'mxCell', {'id': '1', 'parent': '0'})

    # Helper function to add elements
    def add_node(cell_id, value, x, y, width, height, style, parent='1'):
        cell = ET.SubElement(root, 'mxCell', {
            'id': cell_id,
            'value': value,
            'style': style,
            'vertex': '1',
            'parent': parent
        })
        ET.SubElement(cell, 'mxGeometry', {
            'x': str(x),
            'y': str(y),
            'width': str(width),
            'height': str(height),
            'as': 'geometry'
        })
        return cell

    def add_edge(edge_id, source_id, target_id, label='', style=None):
        default_style = (
            'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;'
            'strokeColor=#64748B;strokeWidth=2;endArrow=classic;endFill=1;fontSize=11;fontColor=#475569;'
            'labelBackgroundColor=#FFFFFF;labelBorderColor=#CBD5E1;'
        )
        cell = ET.SubElement(root, 'mxCell', {
            'id': edge_id,
            'value': label,
            'style': style or default_style,
            'edge': '1',
            'source': source_id,
            'target': target_id,
            'parent': '1'
        })
        ET.SubElement(cell, 'mxGeometry', {'relative': '1', 'as': 'geometry'})
        return cell

    # ----------------------------------------------------
    # 1. TOP HEADER BANNER
    # ----------------------------------------------------
    header_style = (
        'rounded=1;whiteSpace=wrap;html=1;arcSize=6;'
        'fillColor=#0F172A;strokeColor=#1E293B;strokeWidth=1;shadow=1;'
        'align=center;verticalAlign=middle;'
    )
    header_html = (
        '<div style="color: #F8FAFC; font-family: Inter, Helvetica, Arial, sans-serif; padding: 10px 20px;">'
        '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #38BDF8; font-weight: 700; margin-bottom: 4px;">'
        'ATHX 2027 • High-Performance Athlete Intelligence Platform'
        '</div>'
        '<div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px;">'
        'How Wearable Data Turns Into Elite Daily Coaching Decisions'
        '</div>'
        '<div style="font-size: 13px; color: #94A3B8; font-weight: 400;">'
        'Non-Technical Executive Overview • Connecting Smart Wearables, Advanced Sports Science, and Interactive Athlete Web Hub'
        '</div>'
        '</div>'
    )
    add_node('banner_header', header_html, 40, 24, 1720, 96, header_style)

    # ----------------------------------------------------
    # COLUMN CONTAINERS & HEADERS
    # ----------------------------------------------------
    col_w = 390
    col_h = 880
    cols_y = 140
    gap = 40
    
    col_configs = [
        {
            'idx': '1',
            'x': 40,
            'step': 'STEP 1 • INPUTS',
            'title': 'Wearables &amp; Workout Logs',
            'desc': 'What the athlete uses &amp; logs daily',
            'bg': '#F0F9FF',
            'border': '#0284C7',
            'badge_bg': '#0284C7',
            'accent': '#0284C7'
        },
        {
            'idx': '2',
            'x': 40 + col_w + gap,
            'step': 'STEP 2 • INTELLIGENCE',
            'title': 'The ATHX Brain (Sports Science)',
            'desc': 'Physiological models &amp; AI reasoning',
            'bg': '#FAF5FF',
            'border': '#9333EA',
            'badge_bg': '#9333EA',
            'accent': '#9333EA'
        },
        {
            'idx': '3',
            'x': 40 + (col_w + gap) * 2,
            'step': 'STEP 3 • VISUALIZATION',
            'title': 'Unified Athlete Dashboard',
            'desc': 'Interactive single-screen web command hub',
            'bg': '#F0FDF4',
            'border': '#059669',
            'badge_bg': '#059669',
            'accent': '#059669'
        },
        {
            'idx': '4',
            'x': 40 + (col_w + gap) * 3,
            'step': 'STEP 4 • REAL-WORLD IMPACT',
            'title': 'Elite Outcomes &amp; Value',
            'desc': 'Measurable results for athlete &amp; coach',
            'bg': '#FFFBEB',
            'border': '#D97706',
            'badge_bg': '#D97706',
            'accent': '#D97706'
        }
    ]

    for c in col_configs:
        container_style = (
            f'rounded=1;whiteSpace=wrap;html=1;arcSize=4;'
            f'fillColor={c["bg"]};strokeColor={c["border"]};strokeWidth=2;shadow=0;'
            'align=left;verticalAlign=top;'
        )
        add_node(f'col_{c["idx"]}', '', c['x'], cols_y, col_w, col_h, container_style)

        # Header card inside container
        col_hdr_style = (
            'rounded=1;whiteSpace=wrap;html=1;arcSize=6;'
            'fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1;shadow=1;'
            'align=center;verticalAlign=middle;'
        )
        col_hdr_html = (
            f'<div style="font-family: Inter, Helvetica, Arial, sans-serif; padding: 6px 12px;">'
            f'<span style="display: inline-block; background-color: {c["badge_bg"]}; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; margin-bottom: 5px;">'
            f'{c["step"]}</span>'
            f'<div style="font-size: 16px; font-weight: 800; color: #1E293B; letter-spacing: -0.3px;">{c["title"]}</div>'
            f'<div style="font-size: 11px; color: #64748B; margin-top: 2px;">{c["desc"]}</div>'
            f'</div>'
        )
        add_node(f'col_hdr_{c["idx"]}', col_hdr_html, c['x'] + 15, cols_y + 15, col_w - 30, 75, col_hdr_style)

    # ----------------------------------------------------
    # CARDS: COLUMN 1 - INPUTS
    # ----------------------------------------------------
    card_base_style = (
        'rounded=1;whiteSpace=wrap;html=1;arcSize=6;'
        'fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;shadow=1;'
        'align=left;verticalAlign=top;spacingLeft=14;spacingRight=14;spacingTop=12;spacingBottom=12;'
        'fontFamily=Inter,Helvetica,Arial,sans-serif;'
    )

    # 1.1 Garmin Watch
    garmin_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #0284C7;">⌚ Garmin Smartwatch</span>'
        '<span style="font-size: 10px; background: #E0F2FE; color: #0369A1; font-weight: 700; padding: 2px 6px; border-radius: 4px;">AUTOMATIC</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">High-Frequency Biometrics &amp; Lifting Logs</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Authentic Overnight HRV:</b> Millisecond vagal recovery<br/>'
        '• <b>GPS Running:</b> Exact distance, splits, elevation &amp; pace<br/>'
        '• <b>Strength Lifting:</b> Exercises, reps, sets &amp; poundages<br/>'
        '• <b>Metabolic Heart Rate:</b> 28,960 kcal tracked with live zones'
        '</div>'
        '</div>'
    )
    add_node('card_c1_garmin', garmin_html, 55, 235, col_w - 30, 145, card_base_style)

    # 1.2 Apple Health
    apple_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #E11D48;">📱 Apple Health &amp; Scales</span>'
        '<span style="font-size: 10px; background: #FFE4E6; color: #BE123C; font-weight: 700; padding: 2px 6px; border-radius: 4px;">DAILY SYNC</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Lifestyle, Sleep Stages &amp; Body Weight</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Sleep Architecture:</b> Deep, Core, REM &amp; awake time (7.0h avg)<br/>'
        '• <b>Body Weight Trajectory:</b> 79.7 kg live vs. 85.0 kg target<br/>'
        '• <b>Resting Heart Rate:</b> 56.8 bpm baseline stability<br/>'
        '• <b>Walking &amp; Mobility:</b> Daily ambient steps &amp; recovery'
        '</div>'
        '</div>'
    )
    add_node('card_c1_apple', apple_html, 55, 395, col_w - 30, 145, card_base_style)

    # 1.3 CrossFit & Gym Workouts
    wod_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #D97706;">🏋️ CrossFit &amp; Gym Notes</span>'
        '<span style="font-size: 10px; background: #FEF3C7; color: #B45309; font-weight: 700; padding: 2px 6px; border-radius: 4px;">STRUCTURED</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Conditioning WODs &amp; Training Details</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>METCON Formats:</b> AMRAP, For Time, EMOM, Chipper<br/>'
        '• <b>Movement Splits:</b> Ergs, thrusters, pull-ups, carries<br/>'
        '• <b>Athlete Perceived Effort:</b> Subjective RPE &amp; fatigue context<br/>'
        '• <b>Coach Session Notes:</b> Focus cues &amp; scaling variations'
        '</div>'
        '</div>'
    )
    add_node('card_c1_wod', wod_html, 55, 555, col_w - 30, 145, card_base_style)

    # 1.4 Automated Pipeline Box
    pipe_html = (
        '<div style="text-align: center;">'
        '<div style="font-size: 13px; font-weight: 800; color: #0284C7; margin-bottom: 4px;">⚡ 100% Automated Ingestion Layer</div>'
        '<div style="font-size: 11px; color: #475569; line-height: 1.45;">'
        'Zero manual Excel tracking • Zero human data entry error<br/>'
        'Direct JSON &amp; Health export synchronization • Offline privacy first'
        '</div>'
        '</div>'
    )
    pipe_style = (
        'rounded=1;whiteSpace=wrap;html=1;arcSize=8;'
        'fillColor=#E0F2FE;strokeColor=#38BDF8;strokeWidth=1.5;shadow=0;'
        'align=center;verticalAlign=middle;padding=10;'
    )
    add_node('card_c1_pipe', pipe_html, 55, 715, col_w - 30, 85, pipe_style)

    # Footnote col 1
    c1_note = (
        '<div style="font-size: 11px; color: #0369A1; text-align: center; font-style: italic;">'
        'Athletes live their normal lives — devices record everything silently.'
        '</div>'
    )
    add_node('c1_note', c1_note, 55, 815, col_w - 30, 35, 'rounded=0;fillColor=none;strokeColor=none;')

    # ----------------------------------------------------
    # CARDS: COLUMN 2 - THE ATHX BRAIN
    # ----------------------------------------------------
    # 2.1 Recovery & Autonomic Balance
    recov_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #9333EA;">🌙 Recovery &amp; HRV Balance</span>'
        '<span style="font-size: 10px; background: #F3E8FF; color: #7E22CE; font-weight: 700; padding: 2px 6px; border-radius: 4px;">AUTONOMIC</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Sports Science: Plews &amp; Buchheit Vagal Model</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>28-Day Garmin HRV Baseline:</b> Individualized normal corridor<br/>'
        '• <b>Smallest Worthwhile Change (SWC):</b> Flags true physiological strain<br/>'
        '• <b>7-Day Rolling Sleep Debt:</b> Deficit vs. 7.5h target<br/>'
        '• <b>Pre-Symptom Warning:</b> Spots central fatigue days before injury'
        '</div>'
        '</div>'
    )
    add_node('card_c2_recov', recov_html, 40 + col_w + gap + 15, 235, col_w - 30, 150, card_base_style)

    # 2.2 Strength & Muscle Progression
    str_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #7C3AED;">💪 Strength &amp; Fatigue Engine</span>'
        '<span style="font-size: 10px; background: #EDE9FE; color: #6D28D9; font-weight: 700; padding: 2px 6px; border-radius: 4px;">LOAD GUARD</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Brzycki 1RM Modeling &amp; ACWR Sweet Spot</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Estimated 1RM (e1RM):</b> Progression on Bench, Squat, Deadlift<br/>'
        '• <b>Safe Workload Ratio (ACWR = 0.84):</b> Optimal injury-safe zone<br/>'
        '• <b>1513 Audited Sets &amp; 597 Tons:</b> Zero missing rep estimations<br/>'
        '• <b>Targeted Muscle Mapping:</b> Maps lifts directly to anatomical groups'
        '</div>'
        '</div>'
    )
    add_node('card_c2_str', str_html, 40 + col_w + gap + 15, 400, col_w - 30, 150, card_base_style)

    # 2.3 Conditioning & Durability
    dur_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #6366F1;">⚡ Conditioning &amp; Durability</span>'
        '<span style="font-size: 10px; background: #E0E7FF; color: #4338CA; font-weight: 700; padding: 2px 6px; border-radius: 4px;">ENDURANCE</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Hyperbolic Critical Speed &amp; METCON Retention</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Critical Speed (CS = 5:09/km):</b> Sustainable aerobic ceiling<br/>'
        '• <b>Anaerobic Battery (D\' = 62.9m):</b> High-intensity sprint reserve<br/>'
        '• <b>CrossFit Durability Index (87.5%):</b> Pace retention across rounds<br/>'
        '• <b>Engine Benchmark:</b> Calibrated pacing targets for competition'
        '</div>'
        '</div>'
    )
    add_node('card_c2_dur', dur_html, 40 + col_w + gap + 15, 565, col_w - 30, 150, card_base_style)

    # 2.4 AI Performance Coach
    coach_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">'
        '<span style="font-size: 14px; font-weight: 800; color: #581C87;">🤖 AI Performance Coach ("Why Engine")</span>'
        '<span style="font-size: 10px; background: #FAF5FF; color: #581C87; font-weight: 700; padding: 2px 6px; border-radius: 4px;">AUDITABLE</span>'
        '</div>'
        '<div style="font-size: 11px; color: #334155; line-height: 1.45;">'
        'Synthesizes recovery signals, sleep debt &amp; training strain.<br/>'
        'Produces daily verdict: <b>Push Hard 🟢 | Maintain 🟡 | Rest &amp; Deload 🔴</b>'
        '</div>'
        '</div>'
    )
    coach_style = (
        'rounded=1;whiteSpace=wrap;html=1;arcSize=8;'
        'fillColor=#F3E8FF;strokeColor=#A855F7;strokeWidth=1.5;shadow=0;'
        'align=left;verticalAlign=middle;padding=10;'
    )
    add_node('card_c2_coach', coach_html, 40 + col_w + gap + 15, 730, col_w - 30, 85, coach_style)

    # Footnote col 2
    c2_note = (
        '<div style="font-size: 11px; color: #7E22CE; text-align: center; font-style: italic;">'
        'No guesswork: 100% deterministic sports science + explainable AI reasoning.'
        '</div>'
    )
    add_node('c2_note', c2_note, 40 + col_w + gap + 15, 830, col_w - 30, 30, 'rounded=0;fillColor=none;strokeColor=none;')

    # ----------------------------------------------------
    # CARDS: COLUMN 3 - DASHBOARD
    # ----------------------------------------------------
    # 3.1 "Today" Command Center
    today_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #059669;">🎯 "Today" Command Center</span>'
        '<span style="font-size: 10px; background: #D1FAE5; color: #047857; font-weight: 700; padding: 2px 6px; border-radius: 4px;">DAILY BRIEF</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Single Unified View for the Morning Routine</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Composite Readiness Score:</b> 96.9% Optimal green badge<br/>'
        '• <b>Today\'s Prescribed Workout:</b> Target movements, sets &amp; pace<br/>'
        '• <b>AI Decision Log:</b> Exact physiological reasons behind advice<br/>'
        '• <b>Immediate Alerts:</b> Flags if training load spikes unsafely'
        '</div>'
        '</div>'
    )
    add_node('card_c3_today', today_html, 40 + (col_w + gap) * 2 + 15, 235, col_w - 30, 145, card_base_style)

    # 3.2 Strength & Aesthetic Anatomy
    ana_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #10B981;">🧬 Strength &amp; Visual Anatomy</span>'
        '<span style="font-size: 10px; background: #ECFDF5; color: #065F46; font-weight: 700; padding: 2px 6px; border-radius: 4px;">AESTHETICS</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Interactive Body Heatmap &amp; 1RM Trajectory</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Interactive 2D Body Map:</b> Muscles glow per selected workout<br/>'
        '• <b>Compound Lift Progress:</b> Trailing curves for Squat, Bench, Deadlift<br/>'
        '• <b>Volume Balance:</b> Audits chest vs. back and quad vs. hamstring<br/>'
        '• <b>Tonnage Timeline:</b> Weekly progressive overload proof'
        '</div>'
        '</div>'
    )
    add_node('card_c3_ana', ana_html, 40 + (col_w + gap) * 2 + 15, 395, col_w - 30, 145, card_base_style)

    # 3.3 Engine & Conditioning Tab
    eng_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #047857;">🏃 Engine &amp; Conditioning Tab</span>'
        '<span style="font-size: 10px; background: #D1FAE5; color: #065F46; font-weight: 700; padding: 2px 6px; border-radius: 4px;">PACING</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Running Paces &amp; Work-Rate Sustainability</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Critical Speed Zones:</b> Exact paces for intervals vs. threshold<br/>'
        '• <b>CrossFit Stamina Retention:</b> Pace preservation across WODs<br/>'
        '• <b>VO2Max Tracking:</b> 55.0 ml/kg/min aerobic fitness score<br/>'
        '• <b>Ergometer Benchmarks:</b> Row, Ski, and Bike power metrics'
        '</div>'
        '</div>'
    )
    add_node('card_c3_eng', eng_html, 40 + (col_w + gap) * 2 + 15, 555, col_w - 30, 145, card_base_style)

    # 3.4 Recovery & Sleep Architecture Tab
    rec_tab_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #059669;">🛌 Recovery &amp; Sleep Monitor</span>'
        '<span style="font-size: 10px; background: #D1FAE5; color: #047857; font-weight: 700; padding: 2px 6px; border-radius: 4px;">RESTORATION</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Sleep Debt &amp; Autonomic HRV Corridor</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>7-Night Deficit Bars:</b> Nightly sleep shortfall vs. 7.5h baseline<br/>'
        '• <b>Garmin HRV Corridor:</b> 43–60ms safe zone vs. 76ms latest boost<br/>'
        '• <b>Sleep Stage Ratios:</b> Deep &amp; REM restoration tracking'
        '</div>'
        '</div>'
    )
    add_node('card_c3_rec', rec_tab_html, 40 + (col_w + gap) * 2 + 15, 715, col_w - 30, 130, card_base_style)

    # ----------------------------------------------------
    # CARDS: COLUMN 4 - REAL-WORLD IMPACT
    # ----------------------------------------------------
    # 4.1 Injury Prevention
    inj_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #D97706;">🛡️ Injury Shield &amp; Safety</span>'
        '<span style="font-size: 10px; background: #FEF3C7; color: #B45309; font-weight: 700; padding: 2px 6px; border-radius: 4px;">DURABILITY</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Stops Overtraining Before Injuries Happen</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Zero Spike Risk:</b> Automatically warns if training ramps too fast<br/>'
        '• <b>Structural Balance:</b> Catches neglected antagonist muscles<br/>'
        '• <b>Nervous System Protection:</b> Backs off when HRV dips steeply'
        '</div>'
        '</div>'
    )
    add_node('card_c4_inj', inj_html, 40 + (col_w + gap) * 3 + 15, 235, col_w - 30, 140, card_base_style)

    # 4.2 Guaranteed Progression
    prog_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #B45309;">📈 Guaranteed Progression</span>'
        '<span style="font-size: 10px; background: #FEF3C7; color: #92400E; font-weight: 700; padding: 2px 6px; border-radius: 4px;">PEAK PHYSIQUE</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">Data-Calibrated Progressive Overload</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Precise Barbell Weights:</b> Calculated percentages, not guesses<br/>'
        '• <b>Aesthetic Targeting:</b> Direct visual proof of muscle development<br/>'
        '• <b>Endurance Pacing:</b> Race at threshold without burning out'
        '</div>'
        '</div>'
    )
    add_node('card_c4_prog', prog_html, 40 + (col_w + gap) * 3 + 15, 390, col_w - 30, 140, card_base_style)

    # 4.3 Effortless Coaching Harmony
    harm_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #92400E;">🤝 Total Coaching Alignment</span>'
        '<span style="font-size: 10px; background: #FEF3C7; color: #78350F; font-weight: 700; padding: 2px 6px; border-radius: 4px;">EFFORTLESS</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">One Link Replaces 4 Disconnected Apps</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Single Shared Truth:</b> Athlete &amp; Coach see the identical numbers<br/>'
        '• <b>Saves 5+ Hours/Week:</b> No manual spreadsheet updating<br/>'
        '• <b>Instant Accessibility:</b> Opens on mobile, tablet, or browser'
        '</div>'
        '</div>'
    )
    add_node('card_c4_harm', harm_html, 40 + (col_w + gap) * 3 + 15, 545, col_w - 30, 140, card_base_style)

    # 4.4 Road to ATHX 2027
    athx_win_html = (
        '<div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">'
        '<span style="font-size: 15px; font-weight: 800; color: #78350F;">🏆 Road to ATHX 2027 Ready</span>'
        '<span style="font-size: 10px; background: #FDE68A; color: #78350F; font-weight: 700; padding: 2px 6px; border-radius: 4px;">THE GOAL</span>'
        '</div>'
        '<div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">31-Week Structured Competition Countdown</div>'
        '<div style="font-size: 11.5px; color: #334155; line-height: 1.55;">'
        '• <b>Target Date:</b> May 27, 2027 Hybrid Competition Peak<br/>'
        '• <b>Compound Capacity:</b> Peak strength + 5k aerobic speed<br/>'
        '• <b>Maximum Confidence:</b> Arrive on the start line in top form'
        '</div>'
        '</div>'
    )
    add_node('card_c4_athx', athx_win_html, 40 + (col_w + gap) * 3 + 15, 700, col_w - 30, 145, card_base_style)

    # ----------------------------------------------------
    # CONNECTING FLOW ARROWS
    # ----------------------------------------------------
    # Arrow Style 1: Blue to Purple
    arr_b2p = (
        'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;'
        'strokeColor=#0284C7;strokeWidth=2.2;endArrow=classic;endFill=1;fontSize=10;fontColor=#0369A1;'
        'fontFamily=Inter,Helvetica,Arial,sans-serif;labelBackgroundColor=#FFFFFF;labelBorderColor=#BAE6FD;'
    )
    # Arrow Style 2: Purple to Green
    arr_p2g = (
        'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;'
        'strokeColor=#9333EA;strokeWidth=2.2;endArrow=classic;endFill=1;fontSize=10;fontColor=#6B21A8;'
        'fontFamily=Inter,Helvetica,Arial,sans-serif;labelBackgroundColor=#FFFFFF;labelBorderColor=#E9D5FF;'
    )
    # Arrow Style 3: Green to Amber
    arr_g2a = (
        'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;'
        'strokeColor=#059669;strokeWidth=2.2;endArrow=classic;endFill=1;fontSize=10;fontColor=#047857;'
        'fontFamily=Inter,Helvetica,Arial,sans-serif;labelBackgroundColor=#FFFFFF;labelBorderColor=#A7F3D0;'
    )

    # Flow 1: Garmin -> Recovery Model
    add_edge('e1_garmin_recov', 'card_c1_garmin', 'card_c2_recov', 'Overnight HRV &amp; HR', arr_b2p)

    # Flow 2: Garmin Lifts + Notes -> Strength Engine
    add_edge('e2_garmin_str', 'card_c1_garmin', 'card_c2_str', 'Sets, Reps &amp; Tonnage', arr_b2p)

    # Flow 3: Garmin Runs + WOD Notes -> Conditioning Engine
    add_edge('e3_wod_dur', 'card_c1_wod', 'card_c2_dur', 'GPS Paces &amp; WOD Times', arr_b2p)

    # Flow 4: Apple Health -> Recovery Engine
    add_edge('e4_apple_recov', 'card_c1_apple', 'card_c2_recov', 'Sleep Stages &amp; Deficit', arr_b2p)

    # Flow 5: Engine Inter-link: Recovery -> AI Coach
    arr_internal_purple = (
        'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;'
        'strokeColor=#A855F7;strokeWidth=1.8;dashed=1;endArrow=classic;endFill=1;fontSize=9;fontColor=#7E22CE;'
        'labelBackgroundColor=#FFFFFF;'
    )
    add_edge('e5_recov_coach', 'card_c2_recov', 'card_c2_coach', 'Recovery Audit', arr_internal_purple)
    add_edge('e6_str_coach', 'card_c2_str', 'card_c2_coach', 'Workload (ACWR)', arr_internal_purple)

    # Flow 7: AI Coach -> Today Tab
    add_edge('e7_coach_today', 'card_c2_coach', 'card_c3_today', 'Daily Readiness &amp; Plan', arr_p2g)

    # Flow 8: Strength Engine -> Visual Anatomy & Strength Tab
    add_edge('e8_str_ana', 'card_c2_str', 'card_c3_ana', 'Muscle Map &amp; 1RM', arr_p2g)

    # Flow 9: Durability Engine -> Engine Tab
    add_edge('e9_dur_eng', 'card_c2_dur', 'card_c3_eng', 'Critical Speed &amp; Capacity', arr_p2g)

    # Flow 10: Autonomic Recovery -> Recovery Tab
    add_edge('e10_rec_rec', 'card_c2_recov', 'card_c3_rec', 'Sleep Debt &amp; HRV Zone', arr_p2g)

    # Flow 11: Today Tab & Readiness -> Injury Shield
    add_edge('e11_today_inj', 'card_c3_today', 'card_c4_inj', 'Safe Training Load', arr_g2a)

    # Flow 12: Strength Tab -> Guaranteed Progression
    add_edge('e12_ana_prog', 'card_c3_ana', 'card_c4_prog', 'Targeted Hypertrophy', arr_g2a)

    # Flow 13: Engine Tab & Recovery -> Coaching Alignment
    add_edge('e13_eng_harm', 'card_c3_eng', 'card_c4_harm', 'Objective Progress', arr_g2a)

    # Flow 14: Unified Hub -> ATHX 2027 Ready
    add_edge('e14_all_athx', 'card_c3_rec', 'card_c4_athx', 'Peak Condition', arr_g2a)

    # ----------------------------------------------------
    # BOTTOM STATUS SUMMARY STRIP
    # ----------------------------------------------------
    footer_style = (
        'rounded=1;whiteSpace=wrap;html=1;arcSize=6;'
        'fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1;shadow=1;'
        'align=center;verticalAlign=middle;'
    )
    footer_html = (
        '<div style="font-family: Inter, Helvetica, Arial, sans-serif; display: flex; justify-content: space-around; align-items: center; padding: 10px 20px;">'
        '<div style="text-align: center;">'
        '<span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; display: block;">Readiness Today</span>'
        '<span style="font-size: 18px; font-weight: 800; color: #059669;">96.9% • Optimal</span>'
        '</div>'
        '<div style="width: 1px; height: 32px; background: #E2E8F0;"></div>'
        '<div style="text-align: center;">'
        '<span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; display: block;">Workload Ratio (ACWR)</span>'
        '<span style="font-size: 18px; font-weight: 800; color: #0284C7;">0.84 • Sweet Spot</span>'
        '</div>'
        '<div style="width: 1px; height: 32px; background: #E2E8F0;"></div>'
        '<div style="text-align: center;">'
        '<span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; display: block;">Audited Volume</span>'
        '<span style="font-size: 18px; font-weight: 800; color: #7C3AED;">597.7 Tons • 1,513 Sets</span>'
        '</div>'
        '<div style="width: 1px; height: 32px; background: #E2E8F0;"></div>'
        '<div style="text-align: center;">'
        '<span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; display: block;">Garmin Overnight HRV</span>'
        '<span style="font-size: 18px; font-weight: 800; color: #059669;">76.0 ms • Restored Vagal Tone</span>'
        '</div>'
        '<div style="width: 1px; height: 32px; background: #E2E8F0;"></div>'
        '<div style="text-align: center;">'
        '<span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; display: block;">Road to ATHX 2027</span>'
        '<span style="font-size: 18px; font-weight: 800; color: #D97706;">31 Weeks Countdown</span>'
        '</div>'
        '</div>'
    )
    add_node('banner_footer', footer_html, 40, 1035, 1720, 60, footer_style)

    # Pretty-print XML
    xml_str = ET.tostring(mxfile, encoding='utf-8')
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent="  ", encoding='utf-8')
    
    output_path = '/Users/ayrtonandre/Documents/work/AGY/athx_architecture.drawio'
    with open(output_path, 'wb') as f:
        f.write(pretty_xml)
        
    print(f"✅ Generated Draw.io file: {output_path} ({len(pretty_xml)} bytes)")

if __name__ == '__main__':
    create_drawio()
