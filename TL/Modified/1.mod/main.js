import { using } from "./ModClasses.js";

using("Terraria");
using("Terraria.ID");
using("Terraria.GameContent");
using("Microsoft.Xna.Framework");
using("Microsoft.Xna.Framework.Graphics");

const Draw =
    SpriteBatch[
        "void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)"
    ];
const Color_Op_Multiply = Color["Color op_Multiply(Color a, float amount)"];

/**
 * Draw a texture with specified parameters.
 * @param {Texture2D} texture - The texture to draw.
 * @param {Vector2} position - The position on the screen where the texture will be drawn.
 * @param {Color} color - The color to apply to the texture.
 * @param {number} rotation - The rotation angle of the texture.
 * @param {Vector2} origin - The origin point for rotation and scaling.
 * @param {number} scale - The scale factor of the texture.
 */
function drawTexture(texture, position, color, rotation, origin, scale) {
    Main.spriteBatch[
        "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
    ](texture, position, null, color, rotation, origin, scale, null, 0.0);
}

import { ModTexture } from "./ModTexture.js";

let SimpleBeam = "";
let Center = "";
let SimpleGlow = "";

Main.Initialize_AlmostEverything.hook((original, self) => {
    original(self);
    SimpleBeam = new ModTexture(`SimpleBeam`).asset.asset.Value;
    Center = new ModTexture(`Center`).asset.asset.Value;
    SimpleGlow = new ModTexture(`SimpleGlow`).asset.asset.Value;
});

function vector(x, y) {
    const vector = Vector2.new();
    vector.X = x;
    vector.Y = y;
    return vector;
}

function rectangle(x, y, width, height) {
    const rectangle = Rectangle.new();
    rectangle.X = x;
    rectangle.Y = y;
    rectangle.Width = width;
    rectangle.Height = height;
    return rectangle;
}

/**
 * Get the color corresponding to the item's rarity.
 * @param {number} rare - The rarity ID of the item.
 * @returns {Color} - The corresponding rarity color.
 */
function getRarityColor(rare) {
    const rarityColors = {
        [-1]: Color.Gray,
        0: Color.White,
        1: Color.Blue,
        2: Color.Green,
        3: Color.Orange,
        4: Color.Red,
        5: Colors.RarityPink,
        6: Color.LightPurple,
        7: Color.Lime,
        8: Color.Yellow,
        9: Color.Cyan,
        10: Color.Red,
        11: Color.Purple,
    };
    return rarityColors[rare] || Color.White;
}

let opacityCycle = 0;

/**
 * Get the current opacity based on a sine wave cycle.
 * @returns {number} - The opacity value between 0.5 and 0.65.
 */
function getOpacity() {
    const cycleValue = Math.sin(opacityCycle * Math.PI);
    return 0.5 + cycleValue * 0.15;
}

Player.UpdateEquips.hook((orig, self, i) => {
    orig(self, i);
    opacityCycle += 0.05;
});

Main.DrawItems.hook((orig, self) => {
    Array.from(Main.item).forEach(item => {
        if (item.active) {
            let centerX = item.Center.X - Main.screenPosition.X;
            let centerY = item.Center.Y - Main.screenPosition.Y;

            const rarityColor = getRarityColor(item.rare);
            const opacity = getOpacity();

            function getOrigin(x, y) {
                return vector(x / 2, y / 2);
            }

            drawTexture(
                SimpleBeam,
                vector(centerX, centerY - 16 * 3),
                Color_Op_Multiply(rarityColor, opacity),
                0,
                getOrigin(6, 144),
                0.75
            );

            if (item.damage > 0) {
                drawTexture(
                    Center,
                    vector(centerX, centerY),
                    Color_Op_Multiply(rarityColor, opacity),
                    0,
                    getOrigin(20, 20),
                    4 + item.Width
                );
            } else {
                drawTexture(
                    Center,
                    vector(centerX, centerY),
                    Color_Op_Multiply(rarityColor, opacity),
                    0,
                    getOrigin(20, 20),
                    1 + item.Width
                );
            }

            drawTexture(
                SimpleGlow,
                vector(centerX, centerY),
                Color_Op_Multiply(rarityColor, opacity),
                0,
                getOrigin(150, 150),
                0.35
            );
        }
    });

    orig(self);
});
