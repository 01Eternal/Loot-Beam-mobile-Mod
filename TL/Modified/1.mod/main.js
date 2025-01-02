/** @format */

import { using } from './ModClasses.js';

using('Terraria');
using('Terraria.ID');
using('Terraria.GameContent');
using('Microsoft.Xna.Framework');
using('Microsoft.Xna.Framework.Graphics');

const Draw = SpriteBatch['void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)'];
const Color_Op_Multiply = Color['Color op_Multiply(Color a, float amount)'];

/**
 * @summary Draw a texture with specified parameters.
 * @param {Texture2D} texture - The texture to draw.
 * @param {Vector2} position - The position on the screen where the texture will be drawn.
 * @param {Color} color - The color to apply to the texture.
 * @param {number} rotation - The rotation angle of the texture.
 * @param {Vector2} origin - The origin point for rotation and scaling.
 * @param {number} scale - The scale factor of the texture.
 */
function drawTexture(texture, position, color, rotation, origin, scale) {
	Main.spriteBatch[
		'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'
	](texture, position, null, color, rotation, origin, scale, null, 0.0);
}

function vector2(x, y) {
	return Vector2.new()['void .ctor(float x, float y)'](x, y);
}

class LootBeam {
	static SIMPLE_BEAM_TEXTURE = null;
	static SIMPLE_GLOW_BEAM_TEXTURE = null;
	static colorOpacityCycle = 0;
	/**
	 * @summary Get the color corresponding to the item's rarity.
	 * @param {number} rare - The rarity ID of the item.
	 * @returns {Color} - The corresponding rarity color.
	 */
	static GetRarityByItemRarity(rare) {
		const RarityIDIndex = {
			[-11]: Colors.RarityAmber,
			[-1]: Color.Gray,
			0: Colors.RarityNormal,
			1: Colors.RarityBlue,
			2: Colors.RarityGreen,
			3: Colors.RarityOrange,
			4: Colors.RarityRed,
			5: Colors.RarityPink,
			6: Colors.RarityPurple,
			7: Colors.RarityLime,
			8: Colors.RarityYellow,
			9: Colors.RarityCyan,
			10: Colors.RarityRed,
			11: Color.Purple
		};

		return RarityIDIndex[rare] || Color.White;
	}

	/**
	 * @summary Get the current opacity based on a sine wave cycle
	 * @returns {number} - The opacity value between 0.5 and 0.65.
	 */
	static getColorOpacity() {
		const cycleValue = Math.sin(LootBeam.colorOpacityCycle * Math.PI);

		return 0.5 + cycleValue * 0.15;
	}

	static DrawBeam() {
		Array.from(Main.item).forEach(item => {
			if (item.active) {
				let centerX = item.Center.X - Main.screenPosition.X;
				let centerY = item.Center.Y - Main.screenPosition.Y;

				const ITEM_TEXTURE = TextureAssets.Item[item.type].Value;
				const RARITY_COLOR = LootBeam.GetRarityByItemRarity(item.rare);
				const COLOR_OPACITY = LootBeam.getColorOpacity();

				function getOrigin(x, y) {
					return Vector2.new()['void .ctor(float x, float y)'](x / 2, y / 2);
				}

				drawTexture(
					LootBeam.SIMPLE_BEAM_TEXTURE,
					vector2(centerX - ITEM_TEXTURE.Width / 4 + 8, centerY - 3 * 16),
					Color_Op_Multiply(RARITY_COLOR, COLOR_OPACITY),
					0,
					getOrigin(6, 144),
					0.75
				);

				drawTexture(
					LootBeam.SIMPLE_GLOW_BEAM_TEXTURE,
					vector2(centerX - ITEM_TEXTURE.Width / 4 + 8, centerY),
					Color_Op_Multiply(RARITY_COLOR, COLOR_OPACITY),
					0,
					getOrigin(150, 150),
					0.4
				);
			}
		});
	}
}

Main.Initialize_AlmostEverything.hook((original, self) => {
	original(self);
	LootBeam.SIMPLE_GLOW_BEAM_TEXTURE = tl.texture.load('Textures/SimpleGlow.png');
	LootBeam.SIMPLE_BEAM_TEXTURE = tl.texture.load('Textures/SimpleBeam.png');
});

Player.UpdateEquips.hook((orig, self, i) => {
	orig(self, i);
	LootBeam.colorOpacityCycle += 0.05;
});

Main.DrawItems.hook((orig, self) => {
	LootBeam.DrawBeam();
	orig(self);
});
