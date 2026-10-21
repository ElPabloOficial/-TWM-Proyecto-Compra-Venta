using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class hacer1
{
    public int id_producto { get; set; }

    public int id_pregunta { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual pregunta id_preguntaNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
