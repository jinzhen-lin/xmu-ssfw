// ==UserScript==
// @name         XMU-SSFW
// @namespace    undefined
// @version      0.3.0
// @description  厦门大学教务系统改造脚本
// @author       linjinzhen
// @match        http://ssfw.xmu.edu.cn/*
// @grant        none
// @run-at       document-body
// @require      http://libs.baidu.com/jquery/1.9.1/jquery.min.js
// ==/UserScript==

jQuery.noConflict();
(function() {
  'use strict';
  jQuery(function() {
    var PortletTitle = jQuery("table#porletsLayout div:eq(5) span").text();
    switch (PortletTitle) {
      case "个人成绩查询":
        ChengjiChaxunPage();
        break;
      case "教学测评":
        JiaoxuePingcePage();
        break;
      default:
        break;
    }
  });

  var GPARules = {
    // GPA计算规则
    scores_max: [100, 94, 89, 84, 80, 77, 74, 71, 67, 63, 59],
    scores_min: [95, 90, 85, 81, 78, 75, 72, 68, 64, 60, 0],
    points: [4.0, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.0, 0],
    grades: {
      "A+": 4.0,
      "A": 4.0,
      "A-": 3.7,
      "B+": 3.3,
      "B": 3.0,
      "B-": 2.7,
      "C+": 2.3,
      "C": 2.0,
      "C-": 1.7,
      "D": 1.0,
      "F": 0
    },
    ResultToPoint: function(result) {
      if (!isNaN(Number(result))) {
        result = Number(result);
        for (var i = 0; i < this.points.length; i++) {
          if (result <= this.scores_max[i] && result >= this.scores_min[i]) {
            return this.points[i];
          }
        }
      } else {
        return this.grades[result];
      }
    }
  };

  function ChengjiChaxunPage() {
    // 修改个人成绩查询页面
    var ChengjiTable = jQuery("table.xmu_table_class:eq(0)");
    ChengjiTable.find("tr:eq(0)").after('<tr><th colspan="8" style="text-align: left;"></th></td></tr>');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button all_check" value="全选/全不选">');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button invert_check" value="反选">');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button except_xiaoxuan" value="除校选外">');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button stat_credits" value="统计学分">');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button calc_gpa" value="计算GPA">');
    ChengjiTable.find("tr:eq(1) th").append('<input type="button" style="width:110px" class="button show_gpa_rules" value="GPA计算规则">');
    ChengjiTable.find("tr:eq(2) th:eq(0)").attr("colspan", "2");
    ChengjiTable.find("tr").find("td:eq(0)[width^=260]").addClass("select_this");
    ChengjiTable.find("tr").find("td:eq(0)[width^=260]").siblings().addClass("select_this");
    ChengjiTable.find("tr").find("td:eq(0)[width^=260]").before('<td width="20px"><input type="checkbox" name="zxkcbox"></td>');
    jQuery("table.xmu_table_class:eq(0) tr:gt(1):has(th) th").addClass("select_term");
    jQuery(".select_term").click(SelectThisTerm);
    jQuery(".invert_check").click(InvertSelect);
    jQuery(".all_check").click(CheckAllorCheckNo);
    jQuery(".calc_gpa").click(CalcGPA);
    jQuery(".show_gpa_rules").click(showGPARules);
    jQuery(".except_xiaoxuan").click(ExceptXiaoxuan);
    jQuery(".select_this").click(SelectThisCourse);
    jQuery(".stat_credits").click(StatCredit);
  }

  function JiaoxuePingcePage() {
    // 教学评估页面的修改
    // 主要改动：修复页面兼容性（显示菜单栏、题目等）、添加自动完成测评功能
    if (jQuery("body").has("form#frm").length !== 0) {
      jQuery(document.createElement('script')).attr("src", "http://ogf9rwckw.bkt.clouddn.com/xmu/ssfw/jxpg-run.js").appendTo("body");
      ShowMenu();
      jQuery("script[src$=jquery\\.min\\.js]").remove();
      jQuery("script[src$=jquery-1\\.8\\.2\\.min\\.js]").remove();
      jQuery("script[src$=jxpg\\.js]").attr("src", "http://ogf9rwckw.bkt.clouddn.com/xmu/ssfw/jxpg-run.js");
      jQuery(".ui_btn").each(function() {
        if (jQuery(this).text() == "返回") {
          jQuery(this).before('<a class = "ui_btn auto_jxpg_this">自动完成该题</a>');
          jQuery(this).before('<a class = "ui_btn auto_jxpg_all">自动完成全部</a>');
        }
      });
      jQuery(".auto_jxpg_all").click(AutoJxpg);
      jQuery(".auto_jxpg_this").click(AutoJxpg);
    }
  }

  function showResultWin(tabHTML, title, height, width) {
    // 显示结果的窗口
    var win = new Ext.Window({
      title: title,
      width: width,
      height: height,
      resizable: true,
      modal: true,
      autoScroll: true,
      html: tabHTML,
      buttonAlign: 'center',
      closeAction: 'close',
      buttons: [{
        text: '确认',
        handler: function() {
          win.hide();
          win.destroy();
        }
      }]
    });
    win.show();
  }

  function ShowMenu() {
    // 实现显示菜单栏等功能，直接从网页底端复制过来的
    jQuery("#topnav>div.current").next("ul").show().siblings("ul").hide();
    jQuery("#topnav>div").click(function() {
      var ulNode = jQuery(this).next("ul");
      ulNode.slideToggle("slow").siblings("ul").hide();
    });
    jQuery(".thirdCurrent").parent().slideToggle("slow").siblings("dl").hide();
    jQuery(".sec").each(function() {

      jQuery(this).children("div").click(function() {
        var ulNode = jQuery(this).next("dl");
        ulNode.slideToggle("slow").siblings("dl").hide();
      });
    });
  }

  function AutoJxpg() {
    // 实现自动完成教学测评功能
    // 修改自：https://github.com/hatsuame/xmu-reformer/blob/master/evaluate.js
    (function fn(window, ko, $, autobutton) {
      var obj = ko.dataFor($("#topic")[0]);
      if (!obj) obj = init();
      (function() {
        if (!obj) return 0;
        if (!obj.isEndTopic()) {
          $("#topic #tableid_" + (obj.displayIndex() - 1) + " input[rbl=100]").click();
          $.ajax({
            type: 'post',
            url: $("#tempSaveUrl").val(),
            data: $("#commonDiv,#tableid_" + (obj.displayIndex() - 1)).find("input,textarea").serialize(),
            success: function(data) {
              if (data.success) changePfgk();
            }
          });
          $(".tempButton i").click();
          if (jQuery(autobutton).hasClass("auto_jxpg_all")) {
            obj.nextTopic();
            setTimeout(function() {
              fn(window, ko, $, autobutton);
            }, 100);
          }
        } else {
          $("#topic .lx3").val("无建议");
          alert("请等待数秒后手动点击提交。");
        }
      })();
    })(window, ko, jQuery, this);
  }

  function CheckAllorCheckNo() {
    // 实现全选/全不选
    var courses = jQuery('input:checkbox[name=zxkcbox]');
    var flag = false;
    courses.each(function() {
      if (!jQuery(this).is(":checked")) {
        flag = true;
        return false;
      }
    });
    courses.each(function() {
      jQuery(this).prop("checked", flag);
    });
  }

  function ExceptXiaoxuan() {
    // 选择除了校选外的课程
    jQuery('input:checkbox[name=zxkcbox]').each(function() {
      var tablerow = jQuery(this).parent("td").parent("tr").children("td");
      var kclb = tablerow.eq(3).children("font").text();
      var xdxz = tablerow.eq(4).children("font").text();
      if (kclb == "通识教育" && xdxz == "选修") {
        jQuery(this).prop("checked", false);
      } else {
        jQuery(this).prop("checked", true);
      }
    });
  }

  function SelectThisCourse() {
    // 选择所点击的课程
    var cb = jQuery(this).parent("tr").children("td:eq(0)").children("input:checkbox[name=zxkcbox]");
    if (cb.is(':checked')) {
      cb.prop("checked", false);
    } else {
      cb.prop("checked", true);
    }
  }

  function SelectThisTerm() {
    // 选择所点击的学期内的所有课程
    var term = jQuery(this).parent("tr");
    var term_courses = term.nextUntil("tr:has(th)").find("td:eq(0)").children("input:checkbox[name=zxkcbox]");
    var flag = false;
    term_courses.each(function() {
      if (!jQuery(this).is(":checked")) {
        flag = true;
        return false;
      }
    });
    term_courses.each(function() {
      jQuery(this).prop("checked", flag);
    });
  }

  function InvertSelect() {
    // 实现反选
    jQuery('input:checkbox[name=zxkcbox]').each(function() {
      if (jQuery(this).is(':checked')) {
        jQuery(this).prop("checked", false);
      } else {
        jQuery(this).prop("checked", true);
      }
    });
  }

  function StatCredit() {
    // 学分统计功能
    var courses = {};
    var credit_kcxz = {
      "选修": 0,
      "必修": 0
    };
    var kclbs = {
      "公共基本": "ggjb",
      "通识教育": "tsjy",
      "学科通修": "xktx",
      "学科或专业方向性课": "xkhzyfxxk",
      "其它教学环节": "qtjxhj"
    };
    var kcxzs = {
      "必修": "bixiu",
      "选修": "xuanxiu"
    };
    for (var i in kclbs) {
      courses[kclbs[i]] = {};
      for (var j in kcxzs) {
        courses[kclbs[i]][kcxzs[j]] = 0;
      }
    }
    jQuery('input:checkbox[name=zxkcbox]:checked').each(function() {
      var tablerow = jQuery(this).parent("td").parent("tr").children("td");
      var kclb = tablerow.eq(3).children("font").text();
      var kcxz = tablerow.eq(4).children("font").text();
      var credit = tablerow.eq(2).children("font").text();
      courses[kclbs[kclb]][kcxzs[kcxz]] += Number(credit);
      credit_kcxz[kcxz] += Number(credit);
    });

    // 构建统计结果表格
    var tabNode = jQuery('<table class="xmu_table_class" width="100%"><tbody></tbody></table>');
    tabNode.append(jQuery('<tr><th>课程类别</th><th>所选课程必修学分</th><th>所选课程选修学分</th></tr>'));
    for (var i in kclbs) {
      var trNode = tabNode[0].insertRow();
      var results = courses[kclbs[i]];
      trNode.className = kclbs[i];
      trNode.insertCell().innerHTML = i;
      for (var j in results) {
        var tdNode = trNode.insertCell();
        tdNode.className = j;
        tdNode.innerHTML = results[j];
      }
    }
    tabNode.append(jQuery('<tr class="total_credit"><th>合计</th><th class="bixiu"></th><th class="xuanxiu"></th></tr>'));
    tabNode.find("tr:last th:eq(1)").text(credit_kcxz["必修"]);
    tabNode.find("tr:last th:eq(2)").text(credit_kcxz["选修"]);
    showResultWin(tabNode[0].outerHTML, "学分统计信息", 300, 600);
  }

  function CalcGPA() {
    // 计算GPA功能
    var selected_courses = [];
    jQuery('input:checkbox[name=zxkcbox]:checked').each(function() {
      var tablerow = jQuery(this).parent("td").parent("tr").children("td");
      var credit = tablerow.eq(2).children("font").text();
      var result = tablerow.eq(5).children("font").text();
      selected_courses.push({
        "credit": credit,
        "result": result,
      });
    });
    if (selected_courses.length !== 0) {
      var points = getPoints(selected_courses);
      var calc_result = Points2GPA(points);
      calc_result.push(getAverage(selected_courses));
      var result_item = ["GPA", "总绩点", "总学分", "平均分"];

      // 构建计算结果表格
      var tabNode = jQuery('<table class="xmu_table_class" width="100%"><tbody></tbody></table>');
      for (var i = 0; i < calc_result.length; i++) {
        var trNode = tabNode[0].insertRow();
        trNode.innerHTML = '<th width="100px">' + result_item[i] + '</th>';
        var tdNode = trNode.insertCell();
        tdNode.align = "center";
        tdNode.innerHTML = calc_result[i];
      };

      var trNode = tabNode[0].insertRow();
      trNode.innerHTML = '<th width="100px">说明：</th>';
      var tdNode = trNode.insertCell();
      tdNode.align = "center";
      tdNode.innerHTML = "仅成绩为分数或等级的所选课程参与计算<br>" + "成绩为合格/不合格或者为空的课程不参与计算";
      showResultWin(tabNode[0].outerHTML, "GPA计算结果", 240, 500);
    } else {
      alert("未选择任何课程");
    }
  }

  function showGPARules() {
    //显示GPA计算规则
    var grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    var tabNode = jQuery('<table class="xmu_table_class" width="100%"><tbody></tbody></table>');
    tabNode.append(jQuery('<tr><th>百分制</th><th>等级制</th><th>绩点</th></tr>'));
    for (var i = 0; i < GPARules.points.length; i++) {
      var trNode = tabNode[0].insertRow();
      trNode.insertCell().innerHTML = GPARules.scores_min[i] + "-" + GPARules.scores_max[i];
      trNode.insertCell().innerHTML = grades[i];
      trNode.insertCell().innerHTML = GPARules.points[i].toFixed(1);
    }
    showResultWin(tabNode[0].outerHTML, "GPA计算规则", 350, 550);
  }

  function getPoints(data) {
    // 获取课程绩点
    var courses = [];
    for (var i = 0; i < data.length; i++) {
      var credit = data[i].credit;
      var result = data[i].result;
      credit = Number(credit);
      if (result === "" || result == "合格") {
        continue;
      }
      var point = GPARules.ResultToPoint(result);
      courses.push({
        "credit": credit,
        "point": point,
      });
    }
    return courses;
  }

  function Points2GPA(courses) {
    // 课程绩点平均（转GPA）
    var total_credit = 0;
    var total_gradepoint = 0;
    for (var i = 0; i < courses.length; i++) {
      var course = courses[i];
      total_gradepoint += course.credit * course.point;
      total_credit += course.credit;
    }
    var gpa = total_gradepoint / total_credit;
    var calc_result = [gpa.toFixed(4), total_gradepoint.toFixed(2), total_credit.toFixed(2)];
    return calc_result;
  }

  function getAverage(courses) {
    //计算平均分
    var total_credit = 0;
    var total_score = 0;
    for (var i = 0; i < courses.length; i++) {
      var course = courses[i];
      if (!isNaN(Number(course.result)) && course.result != "") {
        var score = Number(course.result);
        var credit = Number(course.credit);
        total_score += credit * score;
        total_credit += credit;
      }
    }
    var average = total_score / total_credit;
    return average.toFixed(4);
  }
})();