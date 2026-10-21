import AppKit
import Foundation
struct Figure { let file:String; let title:String; let notes:[(CGFloat,CGFloat,String)] }
let figures:[Figure] = [
Figure(file:"01-journal",title:"หน้าบันทึกประจำวัน",notes:[(440,550,"(1) เลือกบันทึกแบบเช็กอิน\nหรือเขียนไดอารี"),(585,810,"(2) ทางลัดเขียนจดหมาย\nเพื่อระบายความรู้สึก"),(870,1280,"(3) แสดงสถานะว่าเช็กอินแล้ว\nและกลับมาเช็กอินได้ในวันถัดไป"),(1420,1640,"(4) แสดงอารมณ์ วันที่\nและข้อความที่บันทึกไว้")]),
Figure(file:"02-history",title:"หน้าประวัติย้อนหลัง",notes:[(440,535,"(1) กรองรายการตามประเภท\nเช็กอิน ไดอารี หรือจดหมาย"),(580,815,"(2) รายการที่เคยบันทึก\nแสดงอารมณ์ วันที่ และข้อความ"),(1850,1980,"(3) แถบนำทางหลัก\nกลับไปยังหน้าต่าง ๆ ของแอป")]),
Figure(file:"03-progress",title:"หน้าการเติบโต",notes:[(500,835,"(1) สรุปจำนวนวัน No Contact\nและวันที่ดูแลใจในเดือนนี้"),(990,1090,"(2) เลือกช่วงเวลาที่ต้องการดู\nแบบสัปดาห์หรือเดือน"),(1150,1280,"(3) สรุปจำนวนกิจกรรม\nเช็กอิน ไดอารี และผ่านช่วงคิดถึง"),(1300,1760,"(4) กราฟแสดงอารมณ์\nตามวันที่ที่มีการเช็กอิน")]),
Figure(file:"04-settings",title:"หน้าตั้งค่า",notes:[(445,765,"(1) ข้อมูลบัญชีผู้ใช้งาน\nและปุ่มออกจากระบบ"),(770,1245,"(2) กำหนดวันเริ่ม No Contact\nแล้วกดบันทึกวันที่"),(1285,1830,"(3) เพิ่มเหตุผลที่เลือกตัวเอง\nเพื่อใช้เตือนใจในวันที่ลังเล")]),
Figure(file:"05-urge-support",title:"หน้าเครื่องมือพักใจ",notes:[(210,270,"(1) แสดงลำดับขั้นตอน\nพร้อมปุ่มย้อนกลับและปิด"),(400,720,"(2) ข้อความชวนให้พัก\nก่อนตัดสินใจติดต่ออีกครั้ง"),(945,1490,"(3) ตัวนับเวลาฝึกหายใจ\nช่วยให้หยุดพักและตั้งสติ"),(1770,1900,"(4) ปุ่มไปเขียนความรู้สึก\nเมื่อพร้อมทำขั้นตอนถัดไป")]),
Figure(file:"06-release-letter",title:"หน้าจดหมายที่ไม่ต้องส่ง",notes:[(590,735,"(1) ช่องระบุผู้รับ\nสามารถเว้นว่างได้"),(760,1625,"(2) พื้นที่เขียนความรู้สึก\nพร้อมแสดงวันที่ของจดหมาย"),(1660,1780,"(3) เก็บจดหมายไว้\nเพื่อกลับมาอ่านในหน้าย้อนหลัง"),(1815,1940,"(4) เลือกปล่อยจดหมายไป\nโดยไม่มีการส่งข้อความถึงใคร")])
]
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("docs/screenshots")
let ink=NSColor(calibratedRed:0.65,green:0.34,blue:0.43,alpha:1)
func label(_ text:String,_ rect:NSRect,_ size:CGFloat,_ bold:Bool=false) {
 let p=NSMutableParagraphStyle(); p.lineSpacing=8
 (text as NSString).draw(in:rect,withAttributes:[.font:NSFont.systemFont(ofSize:size,weight:bold ? .semibold : .regular),.foregroundColor:NSColor.darkGray,.paragraphStyle:p])
}
for f in figures {
 guard let source=NSImage(contentsOf:root.appendingPathComponent(f.file+".png")) else {continue}
 let w:CGFloat=1640,h:CGFloat=2230,top:CGFloat=140,x:CGFloat=40
 let canvas=NSImage(size:NSSize(width:w,height:h)); canvas.lockFocusFlipped(true)
 NSColor.white.setFill();NSRect(x:0,y:0,width:w,height:h).fill()
 label("KEEP GOING · "+f.title,NSRect(x:40,y:30,width:1550,height:70),42,true)
 source.draw(in:NSRect(x:x,y:top,width:945,height:2048),from:.zero,operation:.sourceOver,fraction:1,respectFlipped:true,hints:nil)
 for (i,n) in f.notes.enumerated() {
  let y1=top+n.0,y2=top+n.1,mid=(y1+y2)/2
  let line=NSBezierPath();line.lineWidth=4;line.move(to:NSPoint(x:990,y:y1));line.line(to:NSPoint(x:1010,y:y1));line.line(to:NSPoint(x:1010,y:y2));line.line(to:NSPoint(x:990,y:y2));line.move(to:NSPoint(x:1010,y:mid));line.line(to:NSPoint(x:1060,y:mid));ink.setStroke();line.stroke()
  label(n.2,NSRect(x:1080,y:mid-52,width:520,height:145),30)
  _ = i
 }
 canvas.unlockFocus()
 let bitmap=NSBitmapImageRep(data:canvas.tiffRepresentation!)!
 try bitmap.representation(using:.png,properties:[:])!.write(to:root.appendingPathComponent("annotated/"+f.file+"-annotated.png"))
 print(f.file)
}
