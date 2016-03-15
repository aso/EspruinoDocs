/* Copyright (c) 2016 AsO, AT Port. See the file LICENSE for copying permission. */
/* 
Module for the ST7032 controller in text-based LCDs (16x2)

If you have one of the LCDs with an I2C backpack, just use:

```
I2C1.setup({scl:B6, sda:B7});
var lcd = require("ST7032").connectI2C(I2C1);
lcd.print("Hello World!");
```

You can specify device address following way:
```
require("ST7032").connectI2C(I2C1, 0x3E);
```
*/

exports.connect = function(i2c,addr) {
    return new ST7032(i2c,addr);
};

function ST7032(i2c,addr) {
  // initialise
//  cmd.write(0x33);
//  cmd.write(0x32);
//  cmd.write(0x28);
//  cmd.write(0x0C);
//  cmd.write(0x06);
//  cmd.write(0x01);
  
  // add functions
  cmd= {
    write: function(msg) {
      console.log(addr.toString(16)+" cmd:0x"+msg.toString(16));
      i2c.writeTo(addr, [0x00, msg]);
    }
  };
  data= {
    write: function(msg) {
      console.log(addr.toString(16)+" data:0x"+msg.toString(16));
      i2c.writeTo(addr, [0x40, msg]);
    }
  };
  initialize= function(phase) {
    if (phase==0) {
      cmd.write(0x38);
      cmd.write(0x39);
      cmd.write(0x14);
      cmd.write(0x73); // Contrast
      cmd.write(0x52|4); // ICON/Power(3.3V:1,5V:0)/Contrast
      cmd.write(0x6C);
    } else if(phase==1){
      cmd.write(0x38);
      cmd.write(0x01);
      cmd.write(0x0C);
    };
  };
  initialize(0);
  
  return {
    cmd:cmd,
    data:data,
    initialize: function(){ initialize(1); },
    // clear screen
    clear : function() { cmd.write(0x01); },
    home : function() { cmd.write(0x02); },
    // print text
    print : function(str) {
      for (var i=0;i<str.length;i++)
        data.write(str.charCodeAt(i));
    },
    // flashing block for the current cursor, or underline
    cursor : function(onoff,block) { cmd.write(onoff?(block?0x0F:0x0E):0x0C); },
    // set cursor pos, top left = 0,0
    setCursor : function(x,y) { var l=[0x00,0x40,0x14,0x54]; cmd.write(0x80|(l[y]+x)); },
    // set special character 0..7, data is an array(8) of bytes, and then return to home addr
    createChar : function(ch, data) {
      cmd.write(0x40 | ((ch&7) << 3));
      for (var i=0; i<8; i++) data.write(data[i]);
      cmd.write(0x80);
    }
  };
}

//exports.ST7032 = ST7032;
