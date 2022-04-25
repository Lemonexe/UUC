# UUC Macro guide

One of the features of UUC II, which was released in September 2020, is the macro tab.

It enables users to perform calculations with physical quantities as opposed to simple conversion between units.
The following example shows what it can be used for – details will be explained later, but as you can see, this tool allows you to enter variables with any units you wish, perform any kind of calculations with them and convert results to a unit of choice.
In this case, it is just a simple calculation of volume flow from mass flow, which would, however, be quite annoying without the convenience of UUC, which understands variables as physical quantities, not just as mere numbers, so it automatically processes them as such.  
Note: `//` means line comment

```
density = 900 g/l //oil density
massFlow = 8 Mt/yr //oil mass flow
volFlow = massFlow / density

write(Daily oil volume flow: ; )
convert(volFlow; kbbl/d)
```

Smiley face not intended.
The first three lines simply assign the expression on the right-hand side of equal sign to the variable name on the left-hand side.
Same rules apply as during normal UUC conversion, except now you can reference previously declared variables.
The "interpretation" algorithm is very crude, it simply expands the variable name into the expression, much like it is done in Windows Batch scripts.
The last two lines are built-in functions calls, where arguments are delimited by `;` semicolon.
The only two currently available functions are:
- `write`, which accepts any number of arguments, and, if they are non-empty (argument must be at least a space character), each argument will be a single line
- `convert`, which must have 1-3 arguments: the input expression, the target expression and formatting parameters as a JSON. It works just like a normal conversion, except that now it is accessed by the command instead of GUI. The output is appended to the last message without any line break.

The convert call in the previous example is without formatting parameters (like Output format > automatic).
As a result, the decimal places are a total mess.
Here is another example – calculations of electricity costs for an appliance, which will show how to use formatting parameters:

``` 
//costs of an electrical appliance
charge = 6 CZK/(kW*h) //electricity charges per kWh
current = 10 mA
voltage = 230V
power = current * voltage
costs = power * year * charge //year isn't a variable, that's the expression of one year right here
totalCosts = 600 CZK //total expenditures over the year
/*this
is a block comment*/

write(Electrical power: )
convert(power; W; {"spec":"fixed", "fixed":2}) //display power as W
write(Costs: )
convert(costs; CZK; {"exp":true, "spec":"digits", "digits":3}) //display costs as CZK
write(Share of total costs: )
convert(costs/totalCosts; %; {"spec":"fixed"}) //display how many % of costs is the appliance responsible for
```

In this example, the first convert call uses `spec: fixed` (like Output format > number of decimals, which are specified as `fixed: 2`).
The second call uses `spec: digits` (like Output format > significant digits, which are specified as `digits: 3`). It also uses `exp: true` (like Output format > always scientific notation).
The third call uses number of decimals, but doesn't provide the number, so it defaults to zero.

**Note:** the {curly bracket expressions} from main Converter were not implemented to Macro. The new {} functionality even removes the _need_ for Macro to some degree..
Simply, the two paths have diverged, and now I prefer main Converter over Macro due to its superior UX.

## Useful examples

Here are some specific useful examples.
They could be written in converter GUI as one-liners (see built-in interactive intro), but in macro code it is more readable.

```
/*ABSOLUTE TEMPERATURE
UUC works with temperature difference when processing temperature units, but it can use addition and substraction using constants. Here is how you can do the same thing using macro */

TF0 = 255.372 K //temperature of 0°F in K
TC0 = 273.15 K //temperature of 0°C in K
tF = 95°F //this is supposed to be absolute temperature in °F, but UUC doesn't know that!
write(95 °F is )
convert(tF+TF0-TC0; °C; {"spec": "fixed"}) //using + and -

//GAUGE pressure - using the same logic, but simpler
pGauge = -400 mbar
pAbs = pGauge + atm
write(absolute pressure )
convert(pAbs; mbar)

//NORMAL CUBIC METRE
//UUC provides normal cubic metre as a unit, and it's defined at 0°C and 1 atm. But sometimes you might need it at 20°C:
Ncm20 = 1 atm * 1 m3 / (293.15 K * _R)
write( ;one Ncm at 20°C is )
convert(Ncm20; mol)
```

## Using javascript

The native macro code, called _simple mode_, has very limited possibilities, as it can do nothing else but declare variables and call the few built-in functions that are available.
That's why there is a _javascript mode_, delimited by `<js>` and `</js>` tags – the code between these tags will simply be evaled as a local javascript.
Using the javascript mode you can do absolutely anything, but it requires knowledge of not just javascript itself, but the UUC application architecture as well.
For that purpose I recommend to study **convert_macro.js**, so you can see where exactly is the code evaled (and what is available in current scope), and **convert.js**, to discover all functions you have at your disposal.
Here is just a simple example how to use javascript mode to perform some calculations.
Well, as can be expected, the simple example is actually not-so-simple:

```
//simple mode macro - declaration of variable as we already know it
t2 = 5730 year //radioactive decay half-life of C14 isotope

<js>
//access a built-in function to write some gibberish
functions.write.f('message1', 'message2');

//that can be achieved by a more direct approach ('this' means the global object 'convert')
this.messages.push('message3');

//access the simple mode variable here in JS. It's a Q() instance - an object that represents physical quantity in UUC
this.messages.push(JSON.stringify(variables.t2));

//this is how you define a variable here, directly in javascript
const m0 = this.parseQ('200 mg'); //initial mass of C14
const e = this.parseQ('_e'); //Euler's number
this.messages.push(JSON.stringify(m0));


//now let's begin the magic - define and process values en masse
//I'll do it step by step, but you can reduce it into a single forEach function
let vals = [100, 500, 1500, 1e4]; //values in years
vals = vals.map(n => n + 'yr'); //make it a string with the unit
vals = vals.map(n => convert.parseQ(n)); //parse the string into Q
vals = vals.map(n => convert.divide(n, variables.t2)); //divide year Qs with the half-life Q
vals = vals.map(n => convert.multiply(n, new convert.Q(-1))); //multiply all by -1
vals = vals.map(n => convert.power(e, n)); //exp(n)
vals = vals.map(n => convert.multiply(n, m0)); //multiply with initial mass

const m_ref = this.parseQ('mg'); //target unit, as a reference Q object
vals = vals.map(n => convert.divide(n, m_ref)); //convert to target unit by dividing those Q objects
vals.forEach(n => functions.write.f(n.n.toFixed(1) + ' mg')); //write the results
</js>
```

If you would like to use UUC macros to perform some amazing calculations, but are struggling with it even after you have read this sloppy documentation, you can contact author via email.  
If I have time, I'll be glad to help! To be fair, I'll actually be delighted if somebody uses UUC at all. Thanks for reading :)
