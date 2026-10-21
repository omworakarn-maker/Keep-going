import Foundation
import AppKit
struct Row:Decodable {let number:String;let text:String}
struct Snippet:Decodable {let name:String;let path:String;let range:String;let rows:[Row]}
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("docs/code-figures")
let items=try JSONDecoder().decode([Snippet].self,from:Data(contentsOf:root.appendingPathComponent("snippets.json")))
for item in items {
 let width:CGFloat=1500,height=CGFloat(item.rows.count)*39+170
 let canvas=NSImage(size:NSSize(width:width,height:height));canvas.lockFocusFlipped(true)
 NSColor(calibratedWhite:0.975,alpha:1).setFill();NSRect(x:0,y:0,width:width,height:height).fill()
 let font=NSFont.monospacedSystemFont(ofSize:27,weight:.regular)
 (item.path as NSString).draw(in:NSRect(x:38,y:25,width:1420,height:62),withAttributes:[.font:NSFont.systemFont(ofSize:25,weight:.semibold),.foregroundColor:NSColor.black])
 ("Source lines "+item.range as NSString).draw(at:NSPoint(x:38,y:90),withAttributes:[.font:NSFont.systemFont(ofSize:22),.foregroundColor:NSColor.gray])
 for (i,row) in item.rows.enumerated() {
 let y=CGFloat(i)*39+140
 (row.number as NSString).draw(at:NSPoint(x:25,y:y),withAttributes:[.font:font,.foregroundColor:NSColor.gray])
 let color = row.text.contains("supabase") || row.text.contains("policy") || row.text.contains("user_id") ? NSColor(calibratedRed:0.12,green:0.28,blue:0.55,alpha:1) : NSColor(calibratedWhite:0.12,alpha:1)
 (row.text as NSString).draw(at:NSPoint(x:110,y:y),withAttributes:[.font:font,.foregroundColor:color])
 }
 canvas.unlockFocus();let bitmap=NSBitmapImageRep(data:canvas.tiffRepresentation!)!
 try bitmap.representation(using:.png,properties:[:])!.write(to:root.appendingPathComponent(item.name+".png"))
}
