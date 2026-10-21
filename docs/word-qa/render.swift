import Foundation
import PDFKit
import AppKit
let input=URL(fileURLWithPath:CommandLine.arguments[1])
let output=URL(fileURLWithPath:CommandLine.arguments[2],isDirectory:true)
try FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
guard let document=PDFDocument(url:input) else {exit(3)}
print("pages=\(document.pageCount)")
for index in 0..<document.pageCount {
 guard let page=document.page(at:index) else {continue}
 let bounds=page.bounds(for:.mediaBox)
 let image=NSImage(size:NSSize(width:bounds.width*2,height:bounds.height*2))
 image.lockFocus(); NSColor.white.setFill();NSRect(origin:.zero,size:image.size).fill()
 if let context=NSGraphicsContext.current?.cgContext {context.scaleBy(x:2,y:2);page.draw(with:.mediaBox,to:context)}
 image.unlockFocus()
 let bitmap=NSBitmapImageRep(data:image.tiffRepresentation!)!
 try bitmap.representation(using:.png,properties:[:])!.write(to:output.appendingPathComponent(String(format:"page-%02d.png",index+1)))
}
