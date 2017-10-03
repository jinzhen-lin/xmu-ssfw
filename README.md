# 厦门大学教务系统改造脚本
对[厦门大学师生服务系统](http://ssfw.xmu.edu.cn/cmstar/index.portal)的部分页面进行一些修改。

## 对页面所做的修改
### 登录页面
登录选项默认选择“学生”

### 成绩查询页面
添加计算GPA和统计学分的功能，并支持全选/全不选、反选、选择除校选外的课程、对某个学期的课程进行全选/全不选（点击学期对应的行）等便捷选择方式

### 评教页面
修改页面兼容性（使用非IE6内核也能正常显示评教的题）与实现自动评教等功能。**但经测试，使用非IE6内核提交评教结果，有可能过段时间评教状态会重新变为未评教，但评教中的题目均为已选择的状态，只差最后的提交。所以此修改需慎用！！**

## 使用方法
需要在浏览器上安装插件，推荐使用[Tampermonkey](http://tampermonkey.net/)，支持Chrome, Microsoft Edge, Safari, Opera Next, Firefox 以及各种国产的基于chrome内核的浏览器。

安装插件后到[GreasyFork](https://greasyfork.org/zh-CN/scripts/33033-xmu-ssfw)安装脚本即可。