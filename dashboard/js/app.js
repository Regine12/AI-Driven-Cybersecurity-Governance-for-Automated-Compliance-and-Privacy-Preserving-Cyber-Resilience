/* ================================================================
   AI GOVERNANCE FRAMEWORK - Dashboard App
   ================================================================ */

// Data paths
var DATA_PATHS = {
  iso27001: '../data/iso27001_requirements.json',
  nist_csf2: '../data/nist_csf2_requirements.json',
  cyber_essentials: '../data/cyber_essentials_requirements.json',
  gdpr: '../data/gdpr_requirements.json',
  mappings: '../data/control_mappings.json',
  scenario: '../case_study/scenario.json',
  rules: '../rules/rule_templates.json',
  evidence: [
    '../case_study/evidence/access_control_evidence.json',
    '../case_study/evidence/incident_response_evidence.json',
    '../case_study/evidence/data_protection_evidence.json',
    '../case_study/evidence/risk_assessment_evidence.json'
  ]
};

// Cache
var jsonCache = {};

async function loadJSON(path) {
  if (jsonCache[path]) return jsonCache[path];
  var res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  var data = await res.json();
  jsonCache[path] = data;
  return data;
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  initNavbar();
  initCounters();
  initTabs();
  loadStandard('iso27001');
  loadMappings();
  loadCaseStudy();
  runEvaluation();
});

// ===================== PARTICLES =====================

function initParticles() {
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h;
  var particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var COUNT = Math.min(80, Math.floor(window.innerWidth / 20));
  for (var i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6,182,212,' + p.o + ')';
      ctx.fill();
    }
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'rgba(6,182,212,' + (0.08 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ===================== NAVBAR =====================

function initNavbar() {
  var nav = document.getElementById('navbar');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }

  var sections = document.querySelectorAll('section[id], header[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(l) { l.classList.remove('active'); });
        var id = entry.target.id;
        var link = document.querySelector('.nav-link[href="#' + id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-72px 0px 0px 0px' });
  sections.forEach(function(s) { observer.observe(s); });

  navLinks.forEach(function(l) {
    l.addEventListener('click', function() {
      links.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
    });
  });
}

// ===================== COUNTERS =====================

function initCounters() {
  var counters = document.querySelectorAll('.cyber-counter');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.dataset.target);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(c) { observer.observe(c); });
}

function animateCounter(el, target) {
  var current = 0;
  var step = Math.max(1, Math.floor(target / 30));
  var interval = setInterval(function() {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 40);
}

// ===================== STANDARDS TABS =====================

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadStandard(btn.dataset.standard);
    });
  });
}

async function loadStandard(key) {
  var container = document.getElementById('requirementsContainer');
  container.innerHTML = '<div class="loading-state"><div class="cyber-spinner"></div><span>LOADING REQUIREMENTS...</span></div>';
  try {
    var data = await loadJSON(DATA_PATHS[key]);
    var reqs = data.requirements || data;
    var html = '<div class="requirements-grid">';
    for (var i = 0; i < reqs.length; i++) {
      html += renderRequirement(reqs[i]);
    }
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<div class="loading-state" style="color:var(--red)">ERROR: ' + e.message + '</div>';
  }
}

function renderRequirement(r) {
  var pClass = (r.priority || '').toLowerCase();
  var pLabel = (r.priority || '').toUpperCase();
  var domain = (r.control_domain || '').replace(/_/g, ' ');
  var clause = r.clause_reference || '';
  return '<div class="req-card">' +
    '<div class="req-header">' +
    '<span class="req-id">' + r.requirement_id + '</span>' +
    '<span class="req-priority ' + pClass + '">' + pLabel + '</span>' +
    '</div>' +
    '<div class="req-title">' + r.title + '</div>' +
    '<div class="req-clause">' + clause + '</div>' +
    '<div class="req-desc">' + r.description + '</div>' +
    '<span class="req-domain">' + domain + '</span>' +
    '</div>';
}

// ===================== MAPPINGS =====================

async function loadMappings() {
  var container = document.getElementById('mappingContainer');
  try {
    var data = await loadJSON(DATA_PATHS.mappings);
    var maps = data.mappings || data;
    var html = '<div class="mapping-grid">';
    for (var i = 0; i < maps.length; i++) {
      html += renderMapping(maps[i]);
    }
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<div class="loading-state" style="color:var(--red)">ERROR: ' + e.message + '</div>';
  }
}

function renderMapping(m) {
  var reqs = m.mapped_requirements || [];
  var reqsHtml = '';
  for (var i = 0; i < reqs.length; i++) {
    var r = reqs[i];
    var std = (r.source_standard || '').toLowerCase();
    var cls = 'iso';
    if (std.indexOf('nist') >= 0) cls = 'nist';
    else if (std.indexOf('cyber') >= 0 || std.indexOf('ce') >= 0) cls = 'ce';
    else if (std.indexOf('gdpr') >= 0) cls = 'gdpr';
    reqsHtml += '<div class="map-req-item">' +
      '<span class="map-std-badge ' + cls + '">' + shortStd(r.source_standard) + '</span>' +
      '<span>' + r.requirement_id + '</span>' +
      '<span class="map-rel-badge">' + r.relationship + '</span>' +
      '</div>';
  }
  var domain = (m.control_domain || '').replace(/_/g, ' ');
  return '<div class="map-card">' +
    '<div class="map-id">' + m.mapping_id + '</div>' +
    '<div class="map-objective">' + m.unified_objective + '</div>' +
    '<span class="map-domain">' + domain + '</span>' +
    '<div class="map-reqs">' + reqsHtml + '</div>' +
    '</div>';
}

function shortStd(s) {
  if (!s) return '?';
  var u = s.toUpperCase();
  if (u.indexOf('ISO') >= 0) return 'ISO';
  if (u.indexOf('NIST') >= 0) return 'NIST';
  if (u.indexOf('CYBER') >= 0 || u.indexOf('CE') >= 0) return 'CE';
  if (u.indexOf('GDPR') >= 0) return 'GDPR';
  return u.slice(0, 4);
}

// ===================== CASE STUDY =====================

async function loadCaseStudy() {
  var container = document.getElementById('caseStudyContainer');
  try {
    var scenario = await loadJSON(DATA_PATHS.scenario);
    var evidenceFiles = await Promise.all(DATA_PATHS.evidence.map(function(p) { return loadJSON(p); }));
    container.innerHTML = renderCaseStudy(scenario, evidenceFiles);
  } catch (e) {
    container.innerHTML = '<div class="loading-state" style="color:var(--red)">ERROR: ' + e.message + '</div>';
  }
}

function renderCaseStudy(s, evidenceFiles) {
  var org = s.organisation || s;
  var statsData = [
    { v: org.employee_count || '\u2014', l: 'EMPLOYEES' },
    { v: org.it_systems || '\u2014', l: 'IT SYSTEMS' },
    { v: org.ot_systems || '\u2014', l: 'OT SYSTEMS' },
    { v: (org.data_subjects || 0).toLocaleString(), l: 'DATA SUBJECTS' }
  ];
  var statsHTML = '';
  for (var i = 0; i < statsData.length; i++) {
    var st = statsData[i];
    statsHTML += '<div class="cs-stat">' +
      '<div class="cs-stat-value">' + st.v + '</div>' +
      '<div class="cs-stat-label">' + st.l + '</div>' +
      '</div>';
  }
  var evCards = '';
  for (var j = 0; j < evidenceFiles.length; j++) {
    var ev = evidenceFiles[j];
    var artCount = (ev.artefacts || []).length;
    var domain = (ev.control_domain || '').replace(/_/g, ' ');
    evCards += '<div class="cs-evidence-card">' +
      '<div class="cs-ev-id">' + ev.evidence_id + '</div>' +
      '<div class="cs-ev-domain">' + domain + '</div>' +
      '<div class="cs-ev-artefacts">' + artCount + ' artefact(s) \u2014 ' + (ev.evidence_type || 'N/A') + '</div>' +
      '</div>';
  }
  var desc = org.description || s.description || '';
  return '<div class="case-study-grid">' +
    '<div class="cs-info-card">' +
    '<div class="cs-title">' + (org.name || 'N/A') + '</div>' +
    '<div class="cs-subtitle">' + (org.sector || '') + ' \u2014 ' + (org.jurisdiction || '') + '</div>' +
    '<div class="cs-desc">' + desc + '</div>' +
    '<div class="cs-stats-grid">' + statsHTML + '</div>' +
    '</div>' +
    '<div class="cs-evidence-list">' + evCards + '</div>' +
    '</div>';
}

// ===================== RULE ENGINE =====================

function evaluateCondition(operator, expected, actual) {
  if (actual === undefined || actual === null) {
    return false;
  }
  switch (operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'greater_than': return actual > expected;
    case 'greater_than_or_equal': return actual >= expected;
    case 'less_than': return actual < expected;
    case 'less_than_or_equal': return actual <= expected;
    case 'contains':
      if (typeof actual === 'string') return actual.indexOf(expected) >= 0;
      if (Array.isArray(actual)) return actual.indexOf(expected) >= 0;
      return false;
    case 'exists': return true;
    default: return false;
  }
}

function extractProperties(evidence) {
  var props = {};
  if (!evidence || !evidence.artefacts) return props;
  for (var i = 0; i < evidence.artefacts.length; i++) {
    var art = evidence.artefacts[i];
    if (art.properties) {
      var keys = Object.keys(art.properties);
      for (var j = 0; j < keys.length; j++) {
        props[keys[j]] = art.properties[keys[j]];
      }
    }
  }
  return props;
}

function evaluateRule(rule, evidenceFiles) {
  var results = [];
  var reqIds = rule.target_requirement_ids || rule.applicable_requirements || [];
  for (var ri = 0; ri < reqIds.length; ri++) {
    var reqId = reqIds[ri];
    var ev = null;
    for (var ei = 0; ei < evidenceFiles.length; ei++) {
      var e = evidenceFiles[ei];
      var relIds = e.related_requirement_ids || [];
      if (relIds.indexOf(reqId) >= 0 ||
        (e.control_domain || '').toLowerCase() === (rule.control_domain || '').toLowerCase()) {
        ev = e;
        break;
      }
    }
    if (!ev) {
      results.push({
        evaluation_id: 'EVAL-' + reqId,
        requirement_id: reqId,
        status: 'not_assessed',
        matched_evidence_ids: [],
        missing_evidence: ['No evidence found'],
        rule_id: rule.rule_id,
        details: 'No matching evidence found for this requirement.'
      });
      continue;
    }
    var props = extractProperties(ev);
    var allPass = true;
    var anyPass = false;
    var missing = [];
    for (var ci = 0; ci < rule.conditions.length; ci++) {
      var cond = rule.conditions[ci];
      var fieldName = cond.field || cond.property;
      var actual = props[fieldName];
      var expectedVal = cond.value !== undefined ? cond.value : cond.expected_value;
      var pass = evaluateCondition(cond.operator, expectedVal, actual);
      if (pass) {
        anyPass = true;
      } else {
        allPass = false;
        missing.push(fieldName + ': expected ' + cond.operator + ' ' + expectedVal + ', got ' + actual);
      }
    }
    var status;
    if (allPass) status = 'compliant';
    else if (anyPass) status = 'partially_compliant';
    else status = 'non_compliant';
    var std = inferStandard(reqId);
    results.push({
      evaluation_id: 'EVAL-' + reqId,
      requirement_id: reqId,
      source_standard: std,
      status: status,
      matched_evidence_ids: [ev.evidence_id],
      missing_evidence: missing,
      rule_id: rule.rule_id,
      details: allPass ? 'All conditions met.' : 'Gaps: ' + missing.join('; ')
    });
  }
  return results;
}

function inferStandard(reqId) {
  if (!reqId) return 'Unknown';
  var id = reqId.toUpperCase();
  if (id.indexOf('ISO') === 0 || /^A\d/.test(id)) return 'ISO/IEC 27001:2022';
  if (id.indexOf('NIST') === 0 || /^(GV|ID|PR|DE|RS|RC)\./.test(id)) return 'NIST CSF 2.0';
  if (id.indexOf('CE') === 0 || id.indexOf('FW') === 0 || id.indexOf('SC') === 0 || id.indexOf('AC') === 0 || id.indexOf('MP') === 0 || id.indexOf('PM') === 0) return 'Cyber Essentials';
  if (id.indexOf('GDPR') === 0 || id.indexOf('ART') === 0) return 'GDPR';
  return 'Unknown';
}

// ===================== RUN EVALUATION =====================

async function runEvaluation() {
  var summaryEl = document.getElementById('resultsSummary');
  var tableEl = document.getElementById('resultsTable');
  var traceEl = document.getElementById('traceabilitySection');

  try {
    var promises = [loadJSON(DATA_PATHS.rules)];
    for (var pi = 0; pi < DATA_PATHS.evidence.length; pi++) {
      promises.push(loadJSON(DATA_PATHS.evidence[pi]));
    }
    var loaded = await Promise.all(promises);
    var rulesData = loaded[0];
    var evidenceFiles = loaded.slice(1);
    var rules = rulesData.rules || rulesData;
    var allResults = [];
    for (var ri = 0; ri < rules.length; ri++) {
      var ruleResults = evaluateRule(rules[ri], evidenceFiles);
      for (var rri = 0; rri < ruleResults.length; rri++) {
        allResults.push(ruleResults[rri]);
      }
    }

    // De-duplicate
    var seen = {};
    var unique = [];
    for (var ui = 0; ui < allResults.length; ui++) {
      var r = allResults[ui];
      if (!seen[r.requirement_id]) {
        seen[r.requirement_id] = true;
        unique.push(r);
      }
    }

    var counts = { compliant: 0, partially_compliant: 0, non_compliant: 0, not_assessed: 0 };
    for (var ci = 0; ci < unique.length; ci++) {
      counts[unique[ci].status] = (counts[unique[ci].status] || 0) + 1;
    }
    var totalCount = unique.length;
    var gapsCount = counts.non_compliant + counts.not_assessed;

    // Summary cards
    summaryEl.innerHTML = '<div class="results-summary-grid">' +
      '<div class="result-stat-card"><div class="result-stat-value total">' + totalCount + '</div><div class="result-stat-label">TOTAL</div></div>' +
      '<div class="result-stat-card"><div class="result-stat-value compliant">' + counts.compliant + '</div><div class="result-stat-label">COMPLIANT</div></div>' +
      '<div class="result-stat-card"><div class="result-stat-value partial">' + counts.partially_compliant + '</div><div class="result-stat-label">PARTIAL</div></div>' +
      '<div class="result-stat-card"><div class="result-stat-value non-compliant">' + gapsCount + '</div><div class="result-stat-label">GAPS</div></div>' +
      '</div>';

    // Table
    var rows = '';
    for (var ti = 0; ti < unique.length; ti++) {
      var row = unique[ti];
      var statusLabel = row.status.replace(/_/g, ' ').toUpperCase();
      var evIds = row.matched_evidence_ids.join(', ') || '\u2014';
      rows += '<tr>' +
        '<td class="eval-id">' + row.evaluation_id + '</td>' +
        '<td class="req-id-cell">' + row.requirement_id + '</td>' +
        '<td>' + (row.source_standard || '\u2014') + '</td>' +
        '<td><span class="status-badge ' + row.status + '">' + statusLabel + '</span></td>' +
        '<td>' + row.rule_id + '</td>' +
        '<td>' + evIds + '</td>' +
        '</tr>';
    }

    tableEl.innerHTML = '<table class="results-table">' +
      '<thead><tr>' +
      '<th>EVAL ID</th><th>REQUIREMENT</th><th>STANDARD</th><th>STATUS</th><th>RULE</th><th>EVIDENCE</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>';

    // Traceability for gaps
    var gaps = [];
    for (var gi = 0; gi < unique.length; gi++) {
      if (unique[gi].status !== 'compliant') gaps.push(unique[gi]);
    }
    if (gaps.length > 0) {
      var traceItems = '';
      for (var tii = 0; tii < gaps.length; tii++) {
        traceItems += '<div class="trace-item">' +
          '<div class="trace-label">' + gaps[tii].requirement_id + '</div>' +
          '<div class="trace-value">' + gaps[tii].details + '</div>' +
          '</div>';
      }
      traceEl.innerHTML = '<div class="traceability-card">' +
        '<div class="traceability-title">&gt; GAP TRACEABILITY</div>' +
        traceItems +
        '</div>';
    }
  } catch (e) {
    summaryEl.innerHTML = '<div class="loading-state" style="color:var(--red)">ERROR: ' + e.message + '</div>';
  }
}

// ===================== CYBER TOOLS (Modals) =====================

window.openToolModal = function(tool) {
  var modal = document.getElementById('toolModal');
  var titleEl = document.getElementById('modalTitle');
  var body = document.getElementById('modalBody');

  var tools = {
    password: { title: '> PASSWORD_CHECKER_', fn: passwordToolHTML },
    phishing: { title: '> PHISHING_DETECTOR_', fn: phishingToolHTML },
    headers: { title: '> HEADER_ANALYSER_', fn: headersToolHTML },
    encrypt: { title: '> ENCRYPTION_SUITE_', fn: encryptToolHTML },
    subnet: { title: '> SUBNET_CALCULATOR_', fn: subnetToolHTML },
    jwt: { title: '> JWT_DECODER_', fn: jwtToolHTML }
  };

  var t = tools[tool];
  if (!t) return;
  titleEl.textContent = t.title;
  body.innerHTML = t.fn();
  modal.classList.add('active');
};

window.closeToolModal = function() {
  document.getElementById('toolModal').classList.remove('active');
};

document.addEventListener('click', function(e) {
  if (e.target.id === 'toolModal') window.closeToolModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') window.closeToolModal();
});

// --- PASSWORD CHECKER ---
function passwordToolHTML() {
  return '<div class="form-group">' +
    '<label>ENTER PASSWORD</label>' +
    '<input type="text" class="form-input" id="pwdInput" placeholder="Enter password to check..." oninput="checkPassword()" autocomplete="off" />' +
    '</div>' +
    '<div class="strength-meter"><div class="strength-fill" id="pwdMeter" style="width:0%"></div></div>' +
    '<div class="modal-result" id="pwdResult">Enter a password above to analyse its strength.</div>';
}

window.checkPassword = function() {
  var pwd = document.getElementById('pwdInput').value;
  var meter = document.getElementById('pwdMeter');
  var result = document.getElementById('pwdResult');
  if (!pwd) {
    meter.style.width = '0%';
    result.textContent = 'Enter a password above to analyse its strength.';
    return;
  }
  var score = 0;
  var checks = [];
  if (pwd.length >= 8) { score += 20; checks.push('\u2713 At least 8 characters'); } else { checks.push('\u2717 Less than 8 characters'); }
  if (pwd.length >= 12) { score += 10; checks.push('\u2713 12+ characters (good)'); }
  if (pwd.length >= 16) { score += 10; checks.push('\u2713 16+ characters (excellent)'); }
  if (/[a-z]/.test(pwd)) { score += 10; checks.push('\u2713 Lowercase letters'); } else { checks.push('\u2717 No lowercase letters'); }
  if (/[A-Z]/.test(pwd)) { score += 15; checks.push('\u2713 Uppercase letters'); } else { checks.push('\u2717 No uppercase letters'); }
  if (/[0-9]/.test(pwd)) { score += 15; checks.push('\u2713 Numbers'); } else { checks.push('\u2717 No numbers'); }
  if (/[^A-Za-z0-9]/.test(pwd)) { score += 20; checks.push('\u2713 Special characters'); } else { checks.push('\u2717 No special characters'); }

  var common = ['password','123456','qwerty','admin','letmein','welcome','monkey','dragon','master','abc123'];
  if (common.indexOf(pwd.toLowerCase()) >= 0) { score = Math.min(score, 10); checks.push('\u26A0 Common password detected!'); }

  var charsetSize = 0;
  if (/[a-z]/.test(pwd)) charsetSize += 26;
  if (/[A-Z]/.test(pwd)) charsetSize += 26;
  if (/[0-9]/.test(pwd)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) charsetSize += 32;
  var entropy = Math.round(pwd.length * Math.log2(charsetSize || 1));

  score = Math.min(100, score);
  var level, color;
  if (score < 30) { level = 'VERY WEAK'; color = '#ef4444'; }
  else if (score < 50) { level = 'WEAK'; color = '#f97316'; }
  else if (score < 70) { level = 'FAIR'; color = '#f59e0b'; }
  else if (score < 90) { level = 'STRONG'; color = '#10b981'; }
  else { level = 'VERY STRONG'; color = '#06b6d4'; }

  meter.style.width = score + '%';
  meter.style.background = color;
  meter.style.color = color;
  result.innerHTML = '<strong style="color:' + color + '">' + level + '</strong> (' + score + '/100)\nEntropy: ~' + entropy + ' bits\n\n' + checks.join('\n');
};

// --- PHISHING DETECTOR ---
function phishingToolHTML() {
  return '<div class="form-group">' +
    '<label>ENTER URL TO ANALYSE</label>' +
    '<input type="text" class="form-input" id="phishInput" placeholder="https://example.com" />' +
    '</div>' +
    '<button class="btn btn-primary btn-full" onclick="checkPhishing()" style="margin-top:8px">' +
    '<span class="btn-glow"></span>\u26A1 ANALYSE URL</button>' +
    '<div class="modal-result" id="phishResult">Enter a URL above and click Analyse.</div>';
}

window.checkPhishing = function() {
  var url = document.getElementById('phishInput').value.trim();
  var result = document.getElementById('phishResult');
  if (!url) { result.textContent = 'Please enter a URL.'; return; }

  var flags = [];
  var risk = 0;
  var lower = url.toLowerCase();

  var suspiciousTlds = ['.tk','.ml','.ga','.cf','.gq','.buzz','.top','.xyz','.club','.work','.click','.link'];
  for (var i = 0; i < suspiciousTlds.length; i++) {
    if (lower.indexOf(suspiciousTlds[i]) >= 0) { flags.push('\u26A0 Suspicious TLD: ' + suspiciousTlds[i]); risk += 25; }
  }

  if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    flags.push('\u26A0 IP address used instead of domain'); risk += 30;
  }

  try {
    var hostname = new URL(url.indexOf('http') === 0 ? url : 'http://' + url).hostname;
    var parts = hostname.split('.');
    if (parts.length > 4) { flags.push('\u26A0 Excessive subdomains (' + parts.length + ' levels)'); risk += 20; }
  } catch (e) { flags.push('\u26A0 Invalid URL format'); risk += 15; }

  var brands = ['paypal','google','apple','microsoft','facebook','instagram','amazon','netflix','bank','secure','login','verify','account','update'];
  for (var bi = 0; bi < brands.length; bi++) {
    var b = brands[bi];
    if (lower.indexOf(b) >= 0 && lower.indexOf(b + '.com') < 0 && lower.indexOf(b + '.co') < 0) {
      flags.push('\u26A0 Possible brand impersonation: "' + b + '"'); risk += 25; break;
    }
  }

  if (lower.indexOf('http://') === 0) { flags.push('\u26A0 No HTTPS encryption'); risk += 15; }
  if (url.indexOf('@') >= 0) { flags.push('\u26A0 "@" symbol in URL (credential attempt?)'); risk += 30; }
  if (/[-]{3,}/.test(url)) { flags.push('\u26A0 Excessive hyphens in domain'); risk += 15; }
  if (/%[0-9a-f]{2}/i.test(url)) { flags.push('\u26A0 URL-encoded characters detected'); risk += 10; }

  risk = Math.min(100, risk);
  var level, color;
  if (risk <= 10) { level = 'LOW RISK'; color = '#10b981'; }
  else if (risk <= 40) { level = 'MODERATE RISK'; color = '#f59e0b'; }
  else if (risk <= 70) { level = 'HIGH RISK'; color = '#f97316'; }
  else { level = 'CRITICAL RISK'; color = '#ef4444'; }

  if (flags.length === 0) flags.push('\u2713 No obvious phishing indicators detected');
  result.innerHTML = '<strong style="color:' + color + '">' + level + '</strong> (Score: ' + risk + '/100)\n\n' + flags.join('\n') + '\n\n<em style="color:var(--text-muted)">Note: This is a heuristic check. Always verify with threat intelligence feeds.</em>';
};

// --- HEADER ANALYSER ---
function headersToolHTML() {
  return '<div class="form-group">' +
    '<label>EXPECTED SECURITY HEADERS</label>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">' +
    'This tool checks which security headers a well-configured site should have. ' +
    '(Browser CORS prevents live header fetching, so we provide an educational reference.)' +
    '</p></div>' +
    '<div class="modal-result" id="headerResult" style="font-size:12px;line-height:2">' +
    '<strong style="color:#10b981">\u2713 Content-Security-Policy</strong>\n  Prevents XSS and data injection attacks.\n\n' +
    '<strong style="color:#10b981">\u2713 Strict-Transport-Security (HSTS)</strong>\n  Forces HTTPS connections. Recommended: max-age=31536000; includeSubDomains\n\n' +
    '<strong style="color:#10b981">\u2713 X-Content-Type-Options</strong>\n  Prevents MIME sniffing. Value: nosniff\n\n' +
    '<strong style="color:#10b981">\u2713 X-Frame-Options</strong>\n  Prevents clickjacking. Value: DENY or SAMEORIGIN\n\n' +
    '<strong style="color:#10b981">\u2713 Referrer-Policy</strong>\n  Controls referrer information. Value: strict-origin-when-cross-origin\n\n' +
    '<strong style="color:#10b981">\u2713 Permissions-Policy</strong>\n  Controls browser features. E.g.: geolocation=(), camera=()\n\n' +
    '<strong style="color:#f59e0b">\u25CB X-XSS-Protection</strong>\n  Legacy header. Modern CSP is preferred.\n\n' +
    '<strong style="color:#06b6d4">\u2139 Cross-Origin-Opener-Policy</strong>\n  Isolates browsing context. Value: same-origin\n\n' +
    '<strong style="color:#06b6d4">\u2139 Cross-Origin-Resource-Policy</strong>\n  Protects resources from cross-origin reads. Value: same-origin' +
    '</div>';
}

// --- ENCRYPTION SUITE ---
function encryptToolHTML() {
  return '<div class="form-group">' +
    '<label>INPUT TEXT</label>' +
    '<textarea class="form-input form-textarea" id="encInput" rows="3" placeholder="Enter text to encode/hash..."></textarea>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
    '<button class="btn btn-outline" onclick="encAction(\'base64enc\')">Base64 Encode</button>' +
    '<button class="btn btn-outline" onclick="encAction(\'base64dec\')">Base64 Decode</button>' +
    '<button class="btn btn-outline" onclick="encAction(\'hex\')">Hex Encode</button>' +
    '<button class="btn btn-outline" onclick="encAction(\'sha256\')">SHA-256</button>' +
    '<button class="btn btn-outline" onclick="encAction(\'url\')">URL Encode</button>' +
    '<button class="btn btn-outline" onclick="encAction(\'urldec\')">URL Decode</button>' +
    '</div>' +
    '<div class="modal-result" id="encResult">Select an operation above.</div>';
}

window.encAction = async function(action) {
  var input = document.getElementById('encInput').value;
  var result = document.getElementById('encResult');
  if (!input) { result.textContent = 'Please enter some text first.'; return; }
  try {
    switch (action) {
      case 'base64enc':
        result.textContent = btoa(unescape(encodeURIComponent(input)));
        break;
      case 'base64dec':
        result.textContent = decodeURIComponent(escape(atob(input)));
        break;
      case 'hex':
        var bytes = new TextEncoder().encode(input);
        var hexStr = '';
        for (var i = 0; i < bytes.length; i++) {
          hexStr += bytes[i].toString(16).padStart(2, '0');
        }
        result.textContent = hexStr;
        break;
      case 'sha256':
        var encoded = new TextEncoder().encode(input);
        var hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        var hashArray = new Uint8Array(hashBuffer);
        var hashHex = '';
        for (var j = 0; j < hashArray.length; j++) {
          hashHex += hashArray[j].toString(16).padStart(2, '0');
        }
        result.textContent = hashHex;
        break;
      case 'url':
        result.textContent = encodeURIComponent(input);
        break;
      case 'urldec':
        result.textContent = decodeURIComponent(input);
        break;
    }
  } catch (e) {
    result.textContent = 'Error: ' + e.message;
  }
};

// --- SUBNET CALCULATOR ---
function subnetToolHTML() {
  return '<div class="form-group">' +
    '<label>IP ADDRESS</label>' +
    '<input type="text" class="form-input" id="subnetIp" placeholder="192.168.1.0" />' +
    '</div>' +
    '<div class="form-group">' +
    '<label>CIDR PREFIX (0-32)</label>' +
    '<input type="number" class="form-input" id="subnetCidr" placeholder="24" min="0" max="32" />' +
    '</div>' +
    '<button class="btn btn-primary btn-full" onclick="calcSubnet()" style="margin-top:8px">' +
    '<span class="btn-glow"></span>\u26A1 CALCULATE</button>' +
    '<div class="modal-result" id="subnetResult">Enter an IP and CIDR prefix above.</div>';
}

window.calcSubnet = function() {
  var ipStr = document.getElementById('subnetIp').value.trim();
  var cidr = parseInt(document.getElementById('subnetCidr').value);
  var result = document.getElementById('subnetResult');

  var parts = ipStr.split('.').map(Number);
  if (parts.length !== 4 || parts.some(function(p) { return isNaN(p) || p < 0 || p > 255; })) {
    result.textContent = 'Invalid IP address.'; return;
  }
  if (isNaN(cidr) || cidr < 0 || cidr > 32) {
    result.textContent = 'Invalid CIDR prefix.'; return;
  }

  var ip = ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
  var mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  var network = (ip & mask) >>> 0;
  var broadcast = (network | ~mask) >>> 0;
  var firstHost = cidr >= 31 ? network : (network + 1) >>> 0;
  var lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
  var totalHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;

  function toIP(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }

  var ipClass = parts[0] < 128 ? 'A' : parts[0] < 192 ? 'B' : parts[0] < 224 ? 'C' : parts[0] < 240 ? 'D' : 'E';

  result.textContent = 'Network:     ' + toIP(network) + '/' + cidr +
    '\nSubnet Mask: ' + toIP(mask) +
    '\nBroadcast:   ' + toIP(broadcast) +
    '\nFirst Host:  ' + toIP(firstHost) +
    '\nLast Host:   ' + toIP(lastHost) +
    '\nTotal Hosts: ' + totalHosts.toLocaleString() +
    '\nWildcard:    ' + toIP((~mask) >>> 0) +
    '\nIP Class:    ' + ipClass;
};

// --- JWT DECODER ---
function jwtToolHTML() {
  return '<div class="form-group">' +
    '<label>PASTE JWT TOKEN</label>' +
    '<textarea class="form-input form-textarea" id="jwtInput" rows="4" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>' +
    '</div>' +
    '<button class="btn btn-primary btn-full" onclick="decodeJWT()" style="margin-top:8px">' +
    '<span class="btn-glow"></span>\u26A1 DECODE TOKEN</button>' +
    '<div class="modal-result" id="jwtResult">Paste a JWT above and click Decode.</div>';
}

window.decodeJWT = function() {
  var token = document.getElementById('jwtInput').value.trim();
  var result = document.getElementById('jwtResult');
  if (!token) { result.textContent = 'Please paste a JWT token.'; return; }

  var parts = token.split('.');
  if (parts.length !== 3) { result.textContent = 'Invalid JWT format. Expected 3 parts separated by dots.'; return; }

  try {
    var header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    var expInfo = '';
    if (payload.exp) {
      var expDate = new Date(payload.exp * 1000);
      var now = new Date();
      expInfo = '\nExpiry: ' + expDate.toISOString() + '\nStatus: ' + (expDate > now ? '\u2713 VALID (not expired)' : '\u2717 EXPIRED');
    }
    if (payload.iat) {
      expInfo += '\nIssued: ' + new Date(payload.iat * 1000).toISOString();
    }

    result.innerHTML = '<strong style="color:#06b6d4">HEADER:</strong>\n' + JSON.stringify(header, null, 2) +
      '\n\n<strong style="color:#10b981">PAYLOAD:</strong>\n' + JSON.stringify(payload, null, 2) +
      expInfo +
      '\n\n<strong style="color:var(--text-muted)">SIGNATURE:</strong>\n' + parts[2].slice(0, 40) + '...';
  } catch (e) {
    result.textContent = 'Error decoding JWT: ' + e.message;
  }
};

// ===================== CONTACT FORM =====================

window.handleContactSubmit = function(e) {
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('button[type="submit"]');
  btn.innerHTML = '<span class="btn-glow"></span>\u2713 MESSAGE TRANSMITTED';
  btn.style.background = 'linear-gradient(135deg, #0891b2, #10b981)';
  setTimeout(function() {
    btn.innerHTML = '<span class="btn-glow"></span>\u26A1 TRANSMIT MESSAGE';
    btn.style.background = '';
    form.reset();
  }, 3000);
};
